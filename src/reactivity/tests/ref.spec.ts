/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 16:37:31
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-18 16:17:39
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\tests\ref.spec.ts
 */
import { effect } from "../effect";
import { ref, isRef, unRef, proxyRefs } from "../ref";
describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });

  it("should be reactive", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // same value should not trigger
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  it("shoul make nested properties reactive", () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  it("isRef and unRef", () => {
    let num = ref(18);
    let num2 = 20;
    expect(isRef(num)).toBe(true);
    expect(isRef(num2)).toBe(false);
    expect(unRef(num)).toBe(18);
    expect(unRef(num2)).toBe(20);
  });

  it("proxyRefs", () => {
    let obj = {
      age: ref(18),
      name: "zhangjiasong",
    };
    let proxyRefs_ = proxyRefs(obj);

    expect(obj.age.value).toBe(18);
    expect(proxyRefs_.age).toBe(18);
    expect(proxyRefs_.name).toBe("zhangjiasong");

    proxyRefs_.age = 22;
    expect(proxyRefs_.age).toBe(22);
    expect(proxyRefs_.name).toBe("zhangjiasong");
    proxyRefs_.age = ref(33);
    expect(proxyRefs_.age).toBe(33);
  });
});
