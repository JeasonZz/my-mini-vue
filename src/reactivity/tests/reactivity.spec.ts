/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 10:39:34
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 15:07:38
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

  test("nested reactives", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});
