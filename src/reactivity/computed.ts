/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 11:14:23
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 11:32:32
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\computed.ts
 */
import { ReactivityEffect } from "./effect";
class computeImpl {
  private _dirty: Boolean = true;
  private _effect: any;
  private _value: any;
  constructor(getter, ReactivityEffect) {
    this._effect = new ReactivityEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new computeImpl(getter, ReactivityEffect);
}
