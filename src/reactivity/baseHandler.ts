/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 10:38:56
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 14:16:07
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\baseHandler.ts
 */
//引入effect的监听和触发操作
import { dep, trigger } from "./effect";
//引入响应式对象类型标志位、reactive和readonly用于循环处理子对象，
import { ReactiveFlags, reactive, readonly } from "./reactivity";
//工具函数引入
import { isObject, extend } from "../shared/index";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonly = createGetter(true, true);
//this is a Factory to create proxy's getterHandler
function createGetter(isReadOnly = false, isShallow = false) {
  return function (target, property, receiver) {
    if (property === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    } else if (property === ReactiveFlags.IS_READONLY) {
      return isReadOnly;
    }

    let res = Reflect.get(target, property);
    //shallow 只监听一层，不深入监听
    if (isShallow) {
      return res;
    }
    //深入监听 子引用类型
    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res);
    }
    //不是只读类型，要进行依赖收集
    if (!isReadOnly) {
      //依赖收集
      dep(target, property);
    }
    return res;
  };
}
//this is a Factory to create proxy's setter
function createSetter() {
  return function (target, property, value) {
    let res = Reflect.set(target, property, value);
    //触发依赖
    trigger(target, property);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, property, value) {
    console.warn(`${target}.${property} are not permited to set value`);
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonly,
});
