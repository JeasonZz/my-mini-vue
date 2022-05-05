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
  //引入渲染引擎机制
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
  //对比方法  从前到后层级关系 一般是从组件->元素节点->文本节点
  // n1：原来的subTree
  // n2:现在的subtree
  // container：容器，取决于挂载于哪一个元素
  //parentComponent ：父组件实例，注意是实例
  //anchor：锚点
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
  //文本节点就是父容器内没有标签的文本
  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }
  //在这里判断是否有原来的subtree，如果有则属于对比过程
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
    //优化tips，复用之前的元素
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
        //如果新子节点是textnode 原来是arrayChildren 则直接删除旧的子节点
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        //设置新的文本节点
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & shapeFlags.TEXT_CHILDREN) {
        //如果原来是文本节点，现在是array，则设置文本节点为空字符串，挂载新的数组子节点
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        //这里是diff对比array子节点
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }
  //diff算法核心部分 采用3指针 数组起始公用同一个指针
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length;
    let e1 = c1.length - 1; //旧数组末尾指针
    let e2 = l2 - 1; //新数组末尾指针
    let i = 0; //公用指针
    let move = false;
    let maxNewIndexSoFar = 0;
    //工具函数：判断是否为湘潭Vnode
    function isSameVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }
    //向右移动i
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      //如果是相同虚拟节点，直接递归对比子节点去
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }
    //向左移动e1,e2
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      //同上
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        //旧节点比新节点短
        const nextPos = e2 + 1;
        //数组index从0开始，nextPos最多为l2-1,虚拟节点的el作用展现，
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          //此时anchor 用于patch方法添加元素
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
      //利用map存储新vnode数组的键值对{vnode.key:index索引}
      const keyToNewIndexMap = new Map();
      //创建中间段数组并填值为0，最后存储的都是vnode数组的对新vnode数组顺序的index值
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0;
      }

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        //设置键值对 新数组item的key和对应的index
        keyToNewIndexMap.set(nextChild.key, i);
      }
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          //pathed用于计算找到重复节点的数量，如果超出新节点长度，剩下的直接删除
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        if (prevChild.key != null) {
          //寻找旧vnode在新vnode数组中的位置
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          //没有key只能通过遍历寻找相同元素
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[i])) {
              newIndex = j;
            }
            break;
          }
        }
        if (newIndex === undefined) {
          //未找到直接移除元素
          hostRemove(prevChild.el);
        } else {
          //如果有逆转序列ed情况发生改变move为TRUE，再进行算法，否则算法无意义
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            move = true;
          }
          //旧节点在新新节点数组中位置 为什么要+1？i+1没用，只是个标识
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          //对该虚拟节点内进行patch处理，顺利进入下一层，
          //注意此时该节点顺序对否还未知，只是知道要复用该节点，此时去处理该节点的子节点。
          //所以中间对比部分的el就是在这里复用原来的el的
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          //pathed用于计算找到重复节点的数量，如果超出新节点长度，剩下的直接删除
          patched++;
        }
      }
      //获取最长递增子序列 返回的是递增序列的索引值，并不是newIndexToOldIndexMap的value，即i+1
      //newIndexToOldIndexMap[newIndex - s2] = i + 1;
      const increasingNewIndexSequence = move
        ? getSequence(newIndexToOldIndexMap)
        : [];
      //从尾部开始处理
      let j = increasingNewIndexSequence.length;
      //这里有个点，最长递增子序列的长度必然小于newIndexToOldIndexMap
      //所以
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2; //末尾元素的index
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          //如果映射中没有该元素，则属于新增元素，直接patch
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (move) {
          if (increasingNewIndexSequence[j] !== i) {
            //直接插入新的vnode节点的el
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
    //这里实现path方法容器的更替 这个
    const el = (vnode.el = hostCreateElement(vnode.type));
    let { children, props, shapeFlag } = vnode;
    if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      //如果孩子是文本节点
      el.textContent = children;
    } else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
      //如果孩子是数组节点
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
  //挂载组件
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
    //这里是以组件为单位去添加effect，每个组件都对应一个effect，用以实现最小更新，所以上层组件中监听数据的改变，
    //会导致子组件重新渲染？
    effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        //这里先把组件render返回的vnode树存到instance对象中，用于后面对比
        const { proxy } = instance;
        //render函数中有this.  ref会对其进行依赖收集，this.改变则触发effect。
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance, anchor);
        //组件vnode对象上添加el属性，取该组件最上层元素 （组件的最上层el就是subtree的最上层el）
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
