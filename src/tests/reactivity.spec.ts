/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 10:39:34
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-16 15:15:39
 * @Description: file content
 * @FilePath: \my-mini-vue\src\tests\reactivity.spec.ts
 */
import sum from "../index";
import { reactivity } from "../reactivity";
import { effect } from "../effect";
test("happy path", () => {
  expect(sum(2, 2)).toBe(4);
});

describe("reactivity", () => {
  it("happy path", () => {
    let count = reactivity({
      age: 5,
    });
    effect(() => {});
    expect(count.age).toBe(5);
    count.age++;
    expect(count.age).toBe(6);
  });
});
