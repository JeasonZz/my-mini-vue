/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-18 16:28:52
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 11:31:52
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\tests\computed.spec.ts
 */

import { reactive } from "../reactivity";
import { computed } from "../computed";
describe("computed", () => {
  it("happy path", () => {
    const yser = reactive({
      age: 1,
    });

    const age = computed(() => {
      return yser.age;
    });
    expect(age.value).toBe(1);
  });
  it("should compute lazily", () => {
    let obj = reactive({
      age: 18,
    });
    const computeFn = jest.fn(() => {
      return obj.age;
    });
    const getAge = computed(computeFn);

    expect(computeFn).toHaveBeenCalledTimes(0);
    expect(getAge.value).toBe(18);
    expect(computeFn).toHaveBeenCalledTimes(1);
    expect(getAge.value).toBe(18);
    expect(computeFn).toHaveBeenCalledTimes(1);
    obj.age++;
    expect(getAge.value).toBe(19);
    expect(computeFn).toHaveBeenCalledTimes(2);
  });
});
