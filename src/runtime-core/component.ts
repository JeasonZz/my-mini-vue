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
import { shallowReadonly } from "../reactivity/reactivity";
import { emit } from "./componentEmit";
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
  };
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  // initSlots()
  initProps(instance, instance.vnode.props);
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;

  const { setup } = Component;
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // function Object
  // TODO function
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;

  instance.render = Component.render;
}
