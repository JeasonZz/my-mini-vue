/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:24:32
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:05:40
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\vnode.ts
 */
import { shapeFlags } from "../shared/shapeFlags";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    key: props && props.key,
    el: null,
    shapeFlag: getShapeFlags(type),
  };
  if (typeof children === "string") {
    vnode.shapeFlag |= shapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= shapeFlags.ARRAY_CHILDREN;
  }

  if (vnode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= shapeFlags.SLOT_CHILDREN;
    }
  }
  return vnode;
}
export function createTextNode(text: string) {
  return createVNode(Text, {}, text);
}

function getShapeFlags(type) {
  return typeof type === "string"
    ? shapeFlags.ELEMENT
    : shapeFlags.STATEFUL_COMPONENT;
}
