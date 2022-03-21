/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 16:08:27
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 16:08:28
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\h.ts
 */

import { createVNode } from "./vnode";
export function h(type, props?, children?) {
  return createVNode(type, props, children);
}
