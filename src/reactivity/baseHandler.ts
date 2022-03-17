/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 10:38:56
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 11:25:36
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\baseHandler.ts
 */
import { dep, trigger } from "./effect";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadOnly?: Boolean) {
  return function (target, property, receiver) {
    let res = Reflect.get(target, property);
    if (property === "__v_isReactive") {
      return !isReadOnly;
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
  readonlyGet,
  set(target, property, value) {
    console.warn(`${target}.${property} are not permited to set value`);
    return true;
  },
};
