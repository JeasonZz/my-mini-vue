/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 10:11:13
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 10:20:53
 * @Description: file content
 * @FilePath: \my-mini-vue\src\tests\readonly.spec.ts
 */
import { readonly } from "../reactivity";

describe("readonly", () => {
  it("should make nested values readonly", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });

  it("should call console.warn when set", () => {
    console.warn = jest.fn();
    const user = readonly({
      age: 10,
    });

    user.age = 11;
    expect(console.warn).toHaveBeenCalled();
  });
});
