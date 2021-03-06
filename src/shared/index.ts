/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 10:06:12
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 17:16:52
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\shared\index.ts
 */

export const extend = Object.assign;
//判断是不是为引用类型  object or array
export const isObject = (value) => {
  return value !== null && typeof value === "object";
};
export const hasChanged = (newValue, value) => {
  return !Object.is(newValue, value);
};
export const hasOwn = (target, key) => {
  return Object.prototype.hasOwnProperty.call(target, key);
};

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};
const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};

export const EMPTY_OBJ = {};
