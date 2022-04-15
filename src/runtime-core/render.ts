/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:05:36
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:29:07
 * @Description: file content
 * @FilePath: \my-mini-vue\src\runtime-core\render.ts
 */
import { shapeFlags } from "../shared/shapeFlags";
import { EMPTY_OBJ, isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity/effect";
import { WatchFileKind } from "typescript";
//实现定制化渲染引擎
export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;
  function render(vnode, container) {
    return patch(null, vnode, container, null, null);
  }
  //对比方法
  function patch(n1, n2, container, parentComponent, anchor) {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & shapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log("patchElement");
    console.log("n1", n1);
    console.log("n2", n2);
    //优化关键，复用之前的元素
    const el = (n2.el = n1.el);
    let oldProps = n1.props || EMPTY_OBJ;
    let newProps = n2.props || EMPTY_OBJ;

    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    const c1 = n1.children;
    const { shapeFlag } = n2;
    const c2 = n2.children;

    if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & shapeFlags.ARRAY_CHILDREN) {
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & shapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }
  //diff算法核心部分
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    let i = 0;
    let move = false;
    let maxNewIndexSoFar = 0;
    function isSameVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }
    //向左移动i
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }
    //向右移动e1,e2
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    //旧节点比新节点短
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      //旧节点比新节点长
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      //中间对比
      let s1 = i;
      let s2 = i;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      const keyToNewIndexMap = new Map();
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0;
      }

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[i])) {
              newIndex = j;
            }
            break;
          }
        }
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            move = true;
          }
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
      const increasingNewIndexSequence = move
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (move) {
          if (increasingNewIndexSequence[j] !== i) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    children.forEach((item) => {
      const el = item.el;
      hostRemove(el);
    });
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProps = oldProps[key];
        const nextProps = newProps[key];
        if (prevProps !== nextProps) {
          hostPatchProp(el, key, prevProps, nextProps);
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }

  function mountElement(vnode, container, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type));
    let { children, props, shapeFlag } = vnode;
    if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    for (const key in props) {
      let value = props[key];
      hostPatchProp(el, key, null, value);
    }
    hostInsert(el, container, anchor);
  }
  //对vnode的children数组循环处理
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor);
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    //创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 对组件的实例进行component处理
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }

  function setupRenderEffect(instance, initialVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        //这里先把组件render返回的vnode树存到instance对象中，用于后面对比
        const { proxy } = instance;
        //render函数中有this.  ref会对其进行依赖收集，this.改变则触发effect。
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance, anchor);
        //组件vnode对象上添加el属性，代表该组件最上层元素
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.log("update");
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        //先取后存instance.subTree
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
//获取最长递增子序列
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
