/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 13:37:45
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 15:08:23
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\effect.ts
 */
import { extend } from "./shared/index";

let fnContainer;
let isCollect;

class ReactivityEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: Function;
  public _schedule: Function | undefined;
  constructor(fn: Function, schedule?: Function) {
    this._fn = fn;
    this._schedule = schedule;
  }
  run() {
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
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
  effect.deps.lenghth = 0;
}
let mapContainer = new Map();
export function dep(target, property) {
  if (!fnContainer) return;
  if (!isCollect) return;
  //收集思路 targe -> property -> fn
  let targetMap = mapContainer.get(target);
  if (!targetMap) {
    targetMap = new Map();
    mapContainer.set(target, targetMap);
  }
  let depSet = targetMap.get(property);
  if (!depSet) {
    depSet = new Set();
    targetMap.set(property, depSet);
  }
  if (depSet.has(fnContainer)) return;
  depSet.add(fnContainer);
  fnContainer.deps.push(depSet);
}

export function trigger(target, property) {
  let targetMap = mapContainer.get(target);
  let targetSet = targetMap.get(property);
  for (const reactivityEffect of targetSet) {
    if (reactivityEffect._schedule) {
      reactivityEffect._schedule();
    } else {
      reactivityEffect.run();
    }
  }
}

export function effect(fn: Function, options: any = {}) {
  // let { schedule, onStop } = options;
  let reactivityEffect = new ReactivityEffect(fn, options.schedule);

  extend(reactivityEffect, options);
  // reactivityEffect.onStop = onStop;
  reactivityEffect.run();
  let runner: any = reactivityEffect.run.bind(reactivityEffect);
  //实例挂载到累的run函数上，供stop功能使用实例
  runner.effect = reactivityEffect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
