/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-22 10:18:48
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:27:02
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\componentPublicInstance.ts
 */
import { hasOwn } from "../shared/index";
const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props,
};

export const PublicInstanceProxyHandlers = {
  //是因为在这里解构了，this.xxx会调用get函数，可以在此解构以取_属性对象的值
  get({ _: instance }, key) {
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    if (key in publicPropertiesMap) {
      return publicPropertiesMap[key](instance);
    }
  },
};
