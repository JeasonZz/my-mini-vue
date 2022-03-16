/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 13:37:45
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-16 18:04:45
 * @Description: file content
 * @FilePath: \my-mini-vue\src\effect.ts
 */
class ReactivityEffect {
  private _fn: any;
  deps = [];
  // public _schedule: Function | undefined;
  constructor(fn: Function, public _schedule?) {
    this._fn = fn;
    // this._schedule = schedule;
  }
  run() {
    fnContainer = this;
    return this._fn();
  }
  stop() {
    this.deps.forEach((dep: any) => {
      dep.delete(this);
    });
  }
}
let fnContainer;
let mapContainer = new Map();
export function dep(target, property) {
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
  let { schedule } = options;
  let reactivityEffect = new ReactivityEffect(fn, schedule);
  reactivityEffect.run();
  // reactivityEffect._schedule = schedule;
  let runner: any = reactivityEffect.run.bind(reactivityEffect);
  runner.effect = reactivityEffect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
