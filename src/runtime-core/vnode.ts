/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:24:32
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:05:40
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\vnode.ts
 */
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
  };
  return vnode;
}
