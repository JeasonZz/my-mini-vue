/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 10:38:56
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 14:16:07
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\baseHandler.ts
 */
import { dep, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactivity";
import { isObject, extend } from "../shared/index";
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonly = createGetter(true, true);
function createGetter(isReadOnly = false, isShallow = false) {
  return function (target, property, receiver) {
    if (property === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    } else if (property === ReactiveFlags.IS_READONLY) {
      return isReadOnly;
    }

    let res = Reflect.get(target, property);
    if (isShallow) {
      return res;
    }
    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res);
    }
    if (!isReadOnly) {
      //依赖收集
      dep(target, property);
    }
    return res;
  };
}

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
