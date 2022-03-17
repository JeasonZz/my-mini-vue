/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 10:39:47
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 14:35:42
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\tests\effect.spec.ts
 */
import sum from "../index";
import { reactive } from "../reactivity";
import { effect, stop } from "../effect";

test("happy path", () => {
  expect(sum(2, 2)).toBe(4);
});

describe("effect test", () => {
  it("effect", () => {
    let person = reactive({
      age: 5,
    });
    let ageContainer;
    effect(() => {
      ageContainer = person.age + 1;
    });
    expect(ageContainer).toBe(6);
    person.age++;
    expect(ageContainer).toBe(7);
  });

  it("runner", () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe("foo");
  });

  it("schedule", () => {
    let brotherAge;
    let r;
    let person1 = reactive({
      age: 20,
    });
    const schedule = jest.fn(() => {
      r = runner;
    });
    const runner = effect(
      () => {
        brotherAge = person1.age;
      },
      {
        schedule,
      }
    );
    expect(schedule).not.toHaveBeenCalled();
    expect(brotherAge).toBe(20);
    person1.age++;
    expect(schedule).toHaveBeenCalledTimes(1);
    expect(brotherAge).toBe(20);
    r();
    expect(brotherAge).toBe(21);
  });
  it("stop", () => {
    let dummy;
    let dummy2;
    let num = reactive({
      init: 1,
    });
    const runner = effect(() => {
      dummy = num.init + 1;
    });
    // const runner2 = effect(() => {
    //   dummy2 = num.init + 2;
    // });

    expect(dummy).toBe(2);
    stop(runner);
    num.init++;
    num.init++;
    num.init++;
    // num.init = 2;
    // ++num.init;
    expect(dummy).toBe(2);
    runner();
    expect(dummy).toBe(5);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
