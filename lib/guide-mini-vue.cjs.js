'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// export const enum shapeFlags {
//   ELEMENT = 1,普通标签
//   STATEFUL_COMPONENT = 1 << 1,组件
//   TEXT_CHILDREN = 1 << 2,子节点为文本
//   ARRAY_CHILDREN = 1 << 3,子节点为数组
//   SLOT_CHILDREN = 1 << 4,子节点为slot
// }
const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        key: props && props.key,
        el: null,
        shapeFlag: getShapeFlags(type), //获取该vnode的标志
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        //该虚拟节点本身是组件类型，如果他的children是对象则为slot
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
//创建文本节点
function createTextNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlags(type) {
    return typeof type === "string"
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 16:08:27
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 16:08:28
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\h.ts
 */
function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 10:06:12
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 17:16:52
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\shared\index.ts
 */
const extend = Object.assign;
//判断是不是为引用类型  object or array
const isObject = (value) => {
    return value !== null && typeof value === "object";
};
const hasChanged = (newValue, value) => {
    return !Object.is(newValue, value);
};
const hasOwn = (target, key) => {
    return Object.prototype.hasOwnProperty.call(target, key);
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};
const EMPTY_OBJ = {};

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-22 10:18:48
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:27:02
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\componentPublicInstance.ts
 */
const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInstanceProxyHandlers = {
    //是因为在这里解构了，this.xxx会调用get函数，可以在此解构以取_属性对象的值
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](instance);
        }
    },
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        //这里包装一层函数，让实例上的slots是一个函数
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 13:37:45
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 14:16:03
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\effect.ts
 */
let fnContainer;
let isCollect;
class ReactivityEffect {
    constructor(fn, schedule) {
        this.deps = []; //存储fn中所有使用到的 监听对象特定属性的 depSet
        this.active = true;
        this._fn = fn;
        this._schedule = schedule;
    }
    run() {
        //如果effect 失活：即通过options中的stop停止响应执行，则可以通过暴露的runner手动执行函数
        if (!this.active) {
            return this._fn();
        }
        isCollect = true;
        fnContainer = this;
        const result = this._fn();
        isCollect = false;
        return result;
    }
    stop() {
        if (this.active) {
            //清理
            cleanupEffect(this);
            if (this.onStop) {
                //清理过程中执行一些操作
                this.onStop();
            }
            //失活操作
            this.active = false;
        }
    }
}
//把实例内收集的effct实例 定向清理
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        //这里面的dep是特定target的特定property的收集集合
        dep.delete(effect);
    });
    effect.deps.lenghth = 0;
}
let mapContainer = new Map();
//dep会多次执行
function dep(target, property) {
    if (!isTracking())
        return;
    //收集思路 targe -> property -> fn
    //先看看全局map中有没有劫持过这个target对象，如果没有就建立一个专属于这个map的对象 
    let targetMap = mapContainer.get(target);
    if (!targetMap) {
        targetMap = new Map();
        mapContainer.set(target, targetMap);
    }
    //再看看这个专属map对象里面有没有劫持过这个属性，如果没有新建这个属性的的Set对象（唯一且是个集合，可遍历）
    let depSet = targetMap.get(property);
    if (!depSet) {
        depSet = new Set();
        //将set集合添加到该对象的map中
        targetMap.set(property, depSet);
    }
    // if (depSet.has(fnContainer)) return;
    // depSet.add(fnContainer);
    // fnContainer.deps.push(depSet);
    //以上步骤，找到或创建了一个嵌套的《全局集合》来存储 所有 用到的特定target中特定property的 传入effect的 《函数》
    trackEffects(depSet);
}
function trackEffects(depSet) {
    //此时fnContainer是当前当前执行effect的实例对象（传入一个fn应一个effect）
    //首先判断下集合中有没有存储，已有则不必重复监听
    if (depSet.has(fnContainer))
        return;
    //没有则添加到集合中
    depSet.add(fnContainer);
    //同时这个实例对象也添加该集合，该集合了所有用到该《特定target 特定property》
    fnContainer.deps.push(depSet);
}
//获得reactive的属性时是否继续收集effect函数
function isTracking() {
    return isCollect && fnContainer !== undefined;
}
function trigger(target, property) {
    let targetMap = mapContainer.get(target);
    let targetSet = targetMap.get(property);
    // for (const reactivityEffect of targetSet) {
    //   if (reactivityEffect._schedule) {
    //     reactivityEffect._schedule();
    //   } else {
    //     reactivityEffect.run();
    //   }
    // }
    triggerEffects(targetSet);
}
//触发操作
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect._schedule) {
            effect._schedule();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    // let { schedule, onStop } = options;
    let reactivityEffect = new ReactivityEffect(fn, options.schedule);
    extend(reactivityEffect, options);
    // reactivityEffect.onStop = onStop;
    reactivityEffect.run();
    //提取出该实例对象的run函数，并用bind绑定一下
    let runner = reactivityEffect.run.bind(reactivityEffect);
    //函数也为引用类型，实例挂载到累的run函数上，供stop功能使用实例
    //（对象和对象内的引用类型双向绑定以满足特定操作）
    runner.effect = reactivityEffect;
    //同时返回该函数以实现使用者可以自助触发函数
    return runner;
}

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 10:38:56
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 14:16:07
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\baseHandler.ts
 */
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonly$1 = createGetter(true, true);
//this is a Factory to create proxy's getterHandler
function createGetter(isReadOnly = false, isShallow = false) {
    return function (target, property, receiver) {
        if (property === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (property === "__v_isReadonly" /* IS_READONLY */) {
            return isReadOnly;
        }
        let res = Reflect.get(target, property);
        //shallow 只监听一层，不深入监听
        if (isShallow) {
            return res;
        }
        //深入监听 子引用类型
        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        //不是只读类型，要进行依赖收集
        if (!isReadOnly) {
            //依赖收集
            dep(target, property);
        }
        return res;
    };
}
//this is a Factory to create proxy's setter
function createSetter() {
    return function (target, property, value) {
        let res = Reflect.set(target, property, value);
        //触发依赖
        trigger(target, property);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, property, value) {
        console.warn(`${target}.${property} are not permited to set value`);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonly$1,
});

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 10:38:51
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 16:01:27
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\reactivity.ts
 */
//reactive({})创建一个响应式target，在get or set target's property的时候做一些处理
function reactive(target) {
    return createReactiveObject(target, mutableHandlers);
}
//只读代理
function readonly(target) {
    return createReactiveObject(target, readonlyHandlers);
}
//只代理一层并且只读
function shallowReadonly(target) {
    return createReactiveObject(target, shallowReadonlyHandlers);
}
//一个创建各种响应式对象的工厂
function createReactiveObject(target, baseHandler) {
    if (!isObject(target)) {
        console.warn(`${target} must be a Object`);
    }
    return new Proxy(target, baseHandler);
}

function emit(instance, event, ...arg) {
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...arg);
}

//目标就是将值类型包装成响应式，外加一些边缘case处理
class RefImpl {
    constructor(value) {
        this._is_VueRef = true;
        //将值复制两份进行存储
        this._rawValue = value;
        //边缘case：如果传入引用类型直接转去隔壁reactive
        this._value = convert(value);
        //直接创建set集合存储引用
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        //判断值是否改变
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
//判断是否为ref类型
function isRef(ref) {
    return !!ref._is_VueRef;
}
//是ref返回ref.value,不是ref 直接返回原来的值
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
//传进来一个对象，属性中有ref的值 使用场景：对象中夹杂ref类型
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            //如果原本是ref类型 穿进来的不是ref类型
            if (isRef(Reflect.get(target, key)) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                //原来是响应式对象直接赋值，则触发reactive劫持对象的set，nice 传进来的也是ref类型
                return Reflect.set(target, key, value);
            }
        },
    });
}

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:05:59
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:29:24
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\component.ts
 */
function createComponentInstance(vnode, parentComponent) {
    //实例化组件会把组件类的虚拟节点挂在到实例上
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: [],
        provides: parentComponent ? parentComponent.provides : {},
        parent: parentComponent,
        isMounted: false,
        subTree: {}, //组件的render函数返回的vnode树
    };
    //把当前组件的实例传到emit中去
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    //初始化实例的props，从实例上的类的虚拟节点中取到props，并放到实例的props属性上
    //为什么这么做，而不是在创建实例的时候就赋值？ 可能是因为要项目更工程化，流程化，可读性更高
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    //从此处开始初始化实例上的state
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    //type是使用者创建导出的组件对象，保存在虚拟node中，此时拿出来setup函数并处理
    const Component = instance.type;
    const { setup } = Component;
    //此处代理目的是可以直接通过this.xxx从实例上获取到props data slot等等
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === "object") {
        //setup返回的是一个夹杂响应式属性的对象，用proxyRefs处理一下
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    //将组件上的render函数挂载到实例上的render
    instance.render = Component.render;
}
let currentInstance = null;
function getCurrentInsrance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    const currentInstance = getCurrentInsrance();
    if (currentInstance) {
        let { provides, parent } = currentInstance;
        const parentProvides = parent.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInsrance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:05:48
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 16:07:50
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\createApp.ts
 */
//链式调用
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                //入口去创建根组件的虚拟节点
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

//实现定制化渲染引擎
function createRenderer(options) {
    //引入渲染引擎机制
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        return patch(null, vnode, container, null, null);
    }
    //对比方法  从前到后层级关系 一般是从组件->元素节点->文本节点
    // n1：原来的subTree
    // n2:现在的subtree
    // container：容器，取决于挂载于哪一个元素
    //parentComponent ：父组件实例，注意是实例
    //anchor：锚点
    function patch(n1, n2, container, parentComponent, anchor) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    //文本节点就是父容器内没有标签的文本
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    //在这里判断是否有原来的subtree，如果有则属于对比过程
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement");
        console.log("n1", n1);
        console.log("n2", n2);
        //优化tips，复用之前的元素
        const el = (n2.el = n1.el);
        let oldProps = n1.props || EMPTY_OBJ;
        let newProps = n2.props || EMPTY_OBJ;
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const c1 = n1.children;
        const { shapeFlag } = n2;
        const c2 = n2.children;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                //如果新子节点是textnode 原来是arrayChildren 则直接删除旧的子节点
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                //设置新的文本节点
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                //如果原来是文本节点，现在是array，则设置文本节点为空字符串，挂载新的数组子节点
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                //这里是diff对比array子节点
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    //diff算法核心部分 采用3指针 数组起始公用同一个指针
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        const l2 = c2.length;
        let e1 = c1.length - 1; //旧数组末尾指针
        let e2 = l2 - 1; //新数组末尾指针
        let i = 0; //公用指针
        let move = false;
        let maxNewIndexSoFar = 0;
        //工具函数：判断是否为湘潭Vnode
        function isSameVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        //向右移动i
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            //如果是相同虚拟节点，直接递归对比子节点去
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        //向左移动e1,e2
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            //同上
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            if (i <= e2) {
                //旧节点比新节点短
                const nextPos = e2 + 1;
                //数组index从0开始，nextPos最多为l2-1,虚拟节点的el作用展现，
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    //此时anchor 用于patch方法添加元素
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            //旧节点比新节点长
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            //中间对比
            let s1 = i;
            let s2 = i;
            let patched = 0;
            const toBePatched = e2 - s2 + 1;
            //利用map存储新vnode数组的键值对{vnode.key:index索引}
            const keyToNewIndexMap = new Map();
            //创建中间段数组并填值为0，最后存储的都是vnode数组的对新vnode数组顺序的index值
            const newIndexToOldIndexMap = new Array(toBePatched);
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                //设置键值对 新数组item的key和对应的index
                keyToNewIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    //pathed用于计算找到重复节点的数量，如果超出新节点长度，剩下的直接删除
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) {
                    //寻找旧vnode在新vnode数组中的位置
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    //没有key只能通过遍历寻找相同元素
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[i])) {
                            newIndex = j;
                        }
                        break;
                    }
                }
                if (newIndex === undefined) {
                    //未找到直接移除元素
                    hostRemove(prevChild.el);
                }
                else {
                    //如果有逆转序列ed情况发生改变move为TRUE，再进行算法，否则算法无意义
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        move = true;
                    }
                    //旧节点在新新节点数组中位置 为什么要+1？i+1没用，只是个标识
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    //对该虚拟节点内进行patch处理，顺利进入下一层，
                    //注意此时该节点顺序对否还未知，只是知道要复用该节点，此时去处理该节点的子节点。
                    //所以中间对比部分的el就是在这里复用原来的el的
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    //pathed用于计算找到重复节点的数量，如果超出新节点长度，剩下的直接删除
                    patched++;
                }
            }
            //获取最长递增子序列 返回的是递增序列的索引值，并不是newIndexToOldIndexMap的value，即i+1
            //newIndexToOldIndexMap[newIndex - s2] = i + 1;
            const increasingNewIndexSequence = move
                ? getSequence(newIndexToOldIndexMap)
                : [];
            //从尾部开始处理
            let j = increasingNewIndexSequence.length;
            //这里有个点，最长递增子序列的长度必然小于newIndexToOldIndexMap
            //所以
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2; //末尾元素的index
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    //如果映射中没有该元素，则属于新增元素，直接patch
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (move) {
                    if (increasingNewIndexSequence[j] !== i) {
                        //直接插入新的vnode节点的el
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        children.forEach((item) => {
            const el = item.el;
            hostRemove(el);
        });
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProps = oldProps[key];
                const nextProps = newProps[key];
                if (prevProps !== nextProps) {
                    hostPatchProp(el, key, prevProps, nextProps);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        //这里实现path方法容器的更替 这个
        const el = (vnode.el = hostCreateElement(vnode.type));
        let { children, props, shapeFlag } = vnode;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            //如果孩子是文本节点
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            //如果孩子是数组节点
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        for (const key in props) {
            let value = props[key];
            hostPatchProp(el, key, null, value);
        }
        hostInsert(el, container, anchor);
    }
    //对vnode的children数组循环处理
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    //挂载组件
    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor);
    }
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        //创建组件实例
        const instance = createComponentInstance(initialVNode, parentComponent);
        // 对组件的实例进行component处理
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        //这里是以组件为单位去添加effect，每个组件都对应一个effect，用以实现最小更新，所以上层组件中监听数据的改变，
        //会导致子组件重新渲染？
        effect(() => {
            if (!instance.isMounted) {
                console.log("init");
                //这里先把组件render返回的vnode树存到instance对象中，用于后面对比
                const { proxy } = instance;
                //render函数中有this.  ref会对其进行依赖收集，this.改变则触发effect。
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance, anchor);
                //组件vnode对象上添加el属性，取该组件最上层元素 （组件的最上层el就是subtree的最上层el）
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                //先取后存instance.subTree
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}
//获取最长递增子序列
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevValue, nextValue) {
    //判断是不是事件属性
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextValue);
    }
    if (nextValue == undefined || nextValue == null) {
        //边缘case 移除属性
        el.removeAttribute(key);
    }
    else {
        //设置属性
        el.setAttribute(key, nextValue);
    }
}
function insert(child, parent, anchor) {
    //在achor之前插入 child 如果为null 则在最后插入
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    let parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextNode = createTextNode;
exports.getCurrentInsrance = getCurrentInsrance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.ref = ref;
exports.renderSlots = renderSlots;
