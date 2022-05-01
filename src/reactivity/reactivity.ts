/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 10:38:51
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 16:01:27
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\reactivity.ts
 */
//为实现集中模块化管理，选择模块化处理proxy‘s handler
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandler";

//工具函数引入
import { isObject } from "../shared/index";

//定义判断标志常量
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}
//reactive({})创建一个响应式target，在get or set target's property的时候做一些处理
export function reactive(target) {
  return createReactiveObject(target, mutableHandlers);
}
//只读代理
export function readonly(target) {
  return createReactiveObject(target, readonlyHandlers);
}
//只代理一层并且只读
export function shallowReadonly(target) {
  return createReactiveObject(target, shallowReadonlyHandlers);
}
//判断是否是响应式对象
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}
//判断是否是只读对象
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}
//判断是否为代理对象也就是是否为：响应式对象 或 只读对象
export function isProxy(target) {
  return isReactive(target) || isReadonly(target);
}

//一个创建各种响应式对象的工厂
function createReactiveObject(target, baseHandler) {
  if (!isObject(target)) {
    console.warn(`${target} must be a Object`);
  }
  return new Proxy(target, baseHandler);
}
