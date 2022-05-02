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
  //实例化组件会把组件类的虚拟节点挂在到实例上
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
  //把当前组件的实例传到emit中去
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  //初始化实例的props，从实例上的类的虚拟节点中取到props，并放到实例的props属性上
  //为什么这么做，而不是在创建实例的时候就赋值？ 可能是因为要项目更工程化，流程化，可读性更高
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);
  //从此处开始初始化实例上的state
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
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

function handleSetupResult(instance, setupResult: any) {
  // function Object
  // TODO function
  if (typeof setupResult === "object") {
    //setup返回的是一个夹杂响应式属性的对象，用proxyRefs处理一下
    instance.setupState = proxyRefs(setupResult);
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  //将组件上的render函数挂载到实例上的render
  instance.render = Component.render;
}

let currentInstance = null;
export function getCurrentInsrance() {
  return currentInstance;
}

function setCurrentInstance(instance) {
  currentInstance = instance;
}
