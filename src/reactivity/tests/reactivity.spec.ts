/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 10:39:34
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 11:29:07
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\tests\reactivity.spec.ts
 */
import sum from "../index";
import { reactive, isReactive } from "../reactivity";
import { effect } from "../effect";
test("happy path", () => {
  expect(sum(2, 2)).toBe(4);
});

describe("reactivity", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
  });
});
