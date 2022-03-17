/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 15:59:28
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 16:04:30
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\tests\isProxy.spec.ts
 */
import { isProxy, reactive, readonly } from "../reactivity";
describe("isProxy", () => {
  it("gigigi", () => {
    console.warn = jest.fn();
    let xiaoming = reactive({
      name: "xiaoming",
    });
    let xiaomingReadonly = readonly({
      name: "xiaomingReadonly",
    });
    expect(isProxy(xiaoming)).toBe(true);
    expect(isProxy(xiaomingReadonly)).toBe(true);
    xiaomingReadonly.name = 1111;
    expect(console.warn).toHaveBeenCalled();
  });
});
