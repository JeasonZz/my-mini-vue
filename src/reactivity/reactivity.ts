/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 10:38:51
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 10:32:31
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity.ts
 */
import { dep, trigger } from "./effect";
export function reactivity(target) {
  return new Proxy(target, {
    get(target, property, receiver) {
      let res = Reflect.get(target, property);
      //依赖收集
      dep(target, property);
      return res;
    },
    set(target, property, value) {
      let res = Reflect.set(target, property, value);
      //触发依赖
      trigger(target, property);
      return res;
    },
  });
}

export function readonly(target) {
  return new Proxy(target, {
    get(targe, property, receiver) {
      let res = Reflect.get(targe, property);
      return res;
    },
    set(target, property, value) {
      console.warn(`${target}.${property} are not permited to set value`);
      return true;
    },
  });
}
