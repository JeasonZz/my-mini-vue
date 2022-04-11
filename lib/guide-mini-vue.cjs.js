'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlags(type),
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
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
};
const PublicInstanceProxyHandlers = {
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
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this._schedule = schedule;
    }
    run() {
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
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
//把实例内收集的effct实例 定向清理
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.lenghth = 0;
}
let mapContainer = new Map();
function dep(target, property) {
    if (!isTracking())
        return;
    //收集思路 targe -> property -> fn
    let targetMap = mapContainer.get(target);
    if (!targetMap) {
        targetMap = new Map();
        mapContainer.set(target, targetMap);
    }
    let depSet = targetMap.get(property);
    if (!depSet) {
        depSet = new Set();
        targetMap.set(property, depSet);
    }
    // if (depSet.has(fnContainer)) return;
    // depSet.add(fnContainer);
    // fnContainer.deps.push(depSet);
    trackEffects(depSet);
}
function trackEffects(depSet) {
    if (depSet.has(fnContainer))
        return;
    //每个effect执行都会生成一个实例，全局的set数组收集对应data每个属性的effect实例，
    //每个effect实例同时也收集内部函数涉及data的数集，并且都是引用类型，会同时清理
    depSet.add(fnContainer);
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
    let runner = reactivityEffect.run.bind(reactivityEffect);
    //实例挂载到累的run函数上，供stop功能使用实例
    runner.effect = reactivityEffect;
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
function createGetter(isReadOnly = false, isShallow = false) {
    return function (target, property, receiver) {
        if (property === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (property === "__v_isReadonly" /* IS_READONLY */) {
            return isReadOnly;
        }
        let res = Reflect.get(target, property);
        if (isShallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        if (!isReadOnly) {
            //依赖收集
            dep(target, property);
        }
        return res;
    };
}
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
function reactive(target) {
    return createReactiveObject(target, mutableHandlers);
}
function readonly(target) {
    return createReactiveObject(target, readonlyHandlers);
}
function shallowReadonly(target) {
    return createReactiveObject(target, shallowReadonlyHandlers);
}
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

class RefImpl {
    constructor(value) {
        this._is_VueRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
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
function isRef(ref) {
    return !!ref._is_VueRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(Reflect.get(target, key)) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
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
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
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
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
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
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

//实现定制化渲染引擎
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        return patch(null, vnode, container, null);
    }
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2, container, parentComponent);
        }
    }
    function patchElement(n1, n2, container, parentComponent) {
        console.log("patchElement");
        console.log("n1", n1);
        console.log("n2", n2);
        const el = (n2.el = n1.el);
        let oldProps = n1.props || EMPTY_OBJ;
        let newProps = n2.props || EMPTY_OBJ;
        patchChildren(n1, n2, container, parentComponent);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent) {
        const prevShapeFlag = n1.shapeFlag;
        const c1 = n1.children;
        const { shapeFlag } = n2;
        const c2 = n2.children;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent);
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
    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        let { children, props, shapeFlag } = vnode;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, parentComponent);
        }
        for (const key in props) {
            let value = props[key];
            hostPatchProp(el, key, null, value);
        }
        hostInsert(el, container);
    }
    //对vnode的children数组循环处理
    function mountChildren(children, container, parentComponent) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        //创建组件实例
        const instance = createComponentInstance(initialVNode, parentComponent);
        // 对组件的实例进行component处理
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log("init");
                //这里先把组件render返回的vnode树存到instance对象中，用于后面对比
                const { proxy } = instance;
                //render函数中有this.  ref会对其进行依赖收集，this.改变则触发effect。
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                //组件vnode对象上添加el属性，代表该组件最上层元素
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
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevValue, nextValue) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextValue);
    }
    if (nextValue == undefined || nextValue == null) {
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, nextValue);
    }
}
function insert(el, parent) {
    parent.append(el);
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
