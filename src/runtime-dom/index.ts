import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, prevValue, nextValue) {
  //判断是不是事件属性
  const isOn = (key) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextValue);
  }
  if (nextValue == undefined || nextValue == null) {
    //边缘case 移除属性
    el.removeAttribute(key);
  } else {
    //设置属性
    el.setAttribute(key, nextValue);
  }
}

function insert(child, parent, anchor) {
  //在achor之前插入 child 如果为null 则在最后插入
  parent.insertBefore(child, anchor || null);
}

function remove(child) {
  let parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

function setElementText(el, text) {
  el.textContent = text;
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";
