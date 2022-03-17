/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 10:38:51
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 11:38:58
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\reactivity.ts
 */
import { mutableHandlers, readonlyHandlers } from "./baseHandler";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function reactive(target) {
  return createReactiveObject(target, mutableHandlers);
}

export function readonly(target) {
  return createReactiveObject(target, readonlyHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}
function createReactiveObject(target, baseHandler) {
  return new Proxy(target, baseHandler);
}
