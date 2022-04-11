import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, prevValue, nextValue) {
  const isOn = (key) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextValue);
  }
  if (nextValue == undefined || nextValue == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextValue);
  }
}
function insert(el, parent) {
  parent.append(el);
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
