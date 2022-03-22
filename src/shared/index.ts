/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 10:06:12
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 17:16:52
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\shared\index.ts
 */

export const extend = Object.assign;
export const isObject = (value) => {
  return value !== null && typeof value === "object";
};
export const hasChanged = (newValue, value) => {
  return !Object.is(newValue, value);
};
export const hasOwn = (target, key) => {
  return Object.prototype.hasOwnProperty.call(target, key);
};
