/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:05:36
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 17:59:27
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\render.ts
 */
import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";
export function render(vnode, container) {
  return patch(vnode, container);
}

function patch(vnode, container) {
  if (typeof vnode.type == "string") {
    processElement(vnode, container);
  } else if (isObject(vnode)) {
    processComponent(vnode, container);
  }
}
function processElement(vnode, container) {
  mountElement(vnode, container);
}
function mountElement(vnode, container) {
  const el = document.createElement(vnode.type);
  let { children, props } = vnode;
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el);
  }
  for (const key in props) {
    let value = props[key];
    el.setAttribute(key, value);
  }
  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}
function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);

  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render();
  patch(subTree, container);
}
