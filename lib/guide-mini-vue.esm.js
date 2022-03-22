/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 10:06:12
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 17:16:52
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\shared\index.ts
 */
const isObject = (value) => {
    return value !== null && typeof value === "object";
};

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
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](instance);
        }
    },
};

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:05:59
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:24:46
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\component.ts
 */
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:05:36
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:25:49
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\render.ts
 */
function render(vnode, container) {
    return patch(vnode, container);
}
function patch(vnode, container) {
    if (typeof vnode.type == "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode)) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    let { children, props } = vnode;
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    for (const key in props) {
        let value = props[key];
        el.setAttribute(key, value);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    initialVNode.el = subTree.el;
}

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:24:32
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:05:40
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\vnode.ts
 */
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
    };
    return vnode;
}

/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:05:48
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 16:07:50
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\createApp.ts
 */
function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
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

export { createApp, h };
