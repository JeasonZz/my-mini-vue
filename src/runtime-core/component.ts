/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:05:59
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:29:24
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\component.ts
 */
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";
import { shallowReadonly } from "../reactivity/reactivity";
import { emit } from "./componentEmit";
import { proxyRefs } from "../reactivity/ref";
export function createComponentInstance(vnode, parentComponent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {}, //emit
    slots: [], //插槽
    provides: parentComponent ? parentComponent.provides : {}, //初始化provides
    parent: parentComponent, //父组件实例
    isMounted: false, //flag of isMounted
    subTree: {}, //组件的render函数返回的vnode树
  };
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
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

function handleSetupResult(instance, setupResult: any) {
  // function Object
  // TODO function
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult);
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;

  instance.render = Component.render;
}

let currentInstance = null;
export function getCurrentInsrance() {
  return currentInstance;
}

function setCurrentInstance(instance) {
  currentInstance = instance;
}
