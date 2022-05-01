/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 13:37:45
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 14:16:03
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\effect.ts
 */
import { extend } from "../shared/index";

let fnContainer;
let isCollect;

export class ReactivityEffect {
  private _fn: any;
  deps = [];//存储fn中所有使用到的 监听对象特定属性的 depSet
  active = true;
  onStop?: Function;
  public _schedule: Function | undefined;
  constructor(fn: Function, schedule?: Function) {
    this._fn = fn;
    this._schedule = schedule;
  }
  run() {
    //如果effect 失活：即通过options中的stop停止响应执行，则可以通过暴露的runner手动执行函数
    if (!this.active) {
      return this._fn();
    }
    isCollect = true;
    fnContainer = this;
    const result = this._fn();
    isCollect = false;
    return result;
  }
  stop() {
    if (this.active) {
      //清理
      cleanupEffect(this);
      if (this.onStop) {
        //清理过程中执行一些操作
        this.onStop();
      }
      //失活操作
      this.active = false;
    }
  }
}
//把实例内收集的effct实例 定向清理
function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    //这里面的dep是特定target的特定property的收集集合
    dep.delete(effect);
  });
  effect.deps.lenghth = 0;
}
let mapContainer = new Map();
//dep会多次执行
export function dep(target, property) {
  if (!isTracking()) return;
  //收集思路 targe -> property -> fn
  //先看看全局map中有没有劫持过这个target对象，如果没有就建立一个专属于这个map的对象 
  let targetMap = mapContainer.get(target);
  if (!targetMap) {
    targetMap = new Map();
    mapContainer.set(target, targetMap);
  }
  //再看看这个专属map对象里面有没有劫持过这个属性，如果没有新建这个属性的的Set对象（唯一且是个集合，可遍历）
  let depSet = targetMap.get(property);
  if (!depSet) {
    depSet = new Set();
    //将set集合添加到该对象的map中
    targetMap.set(property, depSet);
  }
  // if (depSet.has(fnContainer)) return;
  // depSet.add(fnContainer);
  // fnContainer.deps.push(depSet);
  //以上步骤，找到或创建了一个嵌套的《全局集合》来存储 所有 用到的特定target中特定property的 传入effect的 《函数》
  trackEffects(depSet);
}

export function trackEffects(depSet) {
  //此时fnContainer是当前当前执行effect的实例对象（传入一个fn应一个effect）
  //首先判断下集合中有没有存储，已有则不必重复监听
  if (depSet.has(fnContainer)) return;
  //没有则添加到集合中
  depSet.add(fnContainer);
  //同时这个实例对象也添加该集合，该集合了所有用到该《特定target 特定property》
  fnContainer.deps.push(depSet);
}

//获得reactive的属性时是否继续收集effect函数
export function isTracking() {
  return isCollect && fnContainer !== undefined;
}

export function trigger(target, property) {
  let targetMap = mapContainer.get(target);
  let targetSet = targetMap.get(property);
  // for (const reactivityEffect of targetSet) {
  //   if (reactivityEffect._schedule) {
  //     reactivityEffect._schedule();
  //   } else {
  //     reactivityEffect.run();
  //   }
  // }
  triggerEffects(targetSet);
}
//触发操作
export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect._schedule) {
      effect._schedule();
    } else {
      effect.run();
    }
  }
}

export function effect(fn: Function, options: any = {}) {
  // let { schedule, onStop } = options;
  let reactivityEffect = new ReactivityEffect(fn, options.schedule);

  extend(reactivityEffect, options);
  // reactivityEffect.onStop = onStop;
  reactivityEffect.run();
  //提取出该实例对象的run函数，并用bind绑定一下
  let runner: any = reactivityEffect.run.bind(reactivityEffect);
  //函数也为引用类型，实例挂载到累的run函数上，供stop功能使用实例
  //（对象和对象内的引用类型双向绑定以满足特定操作）
  runner.effect = reactivityEffect;
  //同时返回该函数以实现使用者可以自助触发函数
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
