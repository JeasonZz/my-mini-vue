/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:05:13
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 16:10:04
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\index.ts
 */
// export { createApp } from "./createApp";
//h:将传进来的对象转化为vnode
export { h } from "./h";
//导出renderSlots
export { renderSlots } from "./helpers/renderSlots";
export { createTextNode } from "./vnode";
export { getCurrentInsrance } from "./component";
export { inject, provide } from "./apiInject";
export { createRenderer } from "./render";
export { nextTick } from "./scheduler";
