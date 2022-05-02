/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:24:32
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:05:40
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\vnode.ts
 */
import { shapeFlags } from "../shared/shapeFlags";
// export const enum shapeFlags {
//   ELEMENT = 1,普通标签
//   STATEFUL_COMPONENT = 1 << 1,组件
//   TEXT_CHILDREN = 1 << 2,子节点为文本
//   ARRAY_CHILDREN = 1 << 3,子节点为数组
//   SLOT_CHILDREN = 1 << 4,子节点为slot
// }
export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
export function createVNode(type, props?, children?) {
  const vnode = {
    type, //类型 App div 等等
    props, //是个对象  里面包含各种类标签或者dom的属性
    children, //该标签的子类或者 子标签 是个数组或者 text 等等
    key: props && props.key, //虚拟节点的key 一般赋值props中的key
    el: null,//最上层的el元素
    shapeFlag: getShapeFlags(type), //获取该vnode的标志
  };
  if (typeof children === "string") {
    vnode.shapeFlag |= shapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= shapeFlags.ARRAY_CHILDREN;
  }

  if (vnode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
    //该虚拟节点本身是组件类型，如果他的children是对象则为slot
    if (typeof children === "object") {
      vnode.shapeFlag |= shapeFlags.SLOT_CHILDREN;
    }
  }
  return vnode;
}
//创建文本节点
export function createTextNode(text: string) {
  return createVNode(Text, {}, text);
}

function getShapeFlags(type) {
  return typeof type === "string"
    ? shapeFlags.ELEMENT
    : shapeFlags.STATEFUL_COMPONENT;
}
