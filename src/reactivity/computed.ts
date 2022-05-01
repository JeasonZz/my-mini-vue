/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 11:14:23
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 11:32:32
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\computed.ts
 */
//计算属性
import { ReactivityEffect } from "./effect";
class computeImpl {
  private _dirty: Boolean = true;
  private _effect: any;
  private _value: any;
  constructor(getter, ReactivityEffect) {
    //创建一个reactivity类的实例
    this._effect = new ReactivityEffect(getter, () => {
      //当函数内的data改变是触发次函数，重新dirty赋为true
      //再调用compute的时候就重新执行函数
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    //刚开始是dirty
    if (this._dirty) {
      //dirty赋为false
      this._dirty = false;
      //执行函数run 依赖收集blabla。。。
      this._value = this._effect.run();
    }
    //返回需要的值
    return this._value;
  }
}

export function computed(getter) {
  return new computeImpl(getter, ReactivityEffect);
}
