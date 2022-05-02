/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:05:48
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 16:07:50
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\createApp.ts
 */
// import { render } from "./render";
import { createVNode } from "./vnode";
//链式调用
export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        //入口去创建根组件的虚拟节点
        const vnode = createVNode(rootComponent);

        render(vnode, rootContainer);
      },
    };
  };
}
