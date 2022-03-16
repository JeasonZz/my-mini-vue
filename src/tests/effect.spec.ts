/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 10:39:47
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-16 17:44:18
 * @Description: file content
 * @FilePath: \my-mini-vue\src\tests\effect.spec.ts
 */
import sum from "../index";
import { reactivity } from "../reactivity";
import { effect, stop } from "../effect";

test("happy path", () => {
  expect(sum(2, 2)).toBe(4);
});

describe("effect test", () => {
  it("effect", () => {
    let person = reactivity({
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
    let person1 = reactivity({
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
    let num = reactivity({
      init: 1,
    });
    const runner = effect(() => {
      dummy = num.init + 1;
    });
    expect(dummy).toBe(2);
    stop(runner);
    num.init++;
    expect(dummy).toBe(2);
    runner();
    expect(dummy).toBe(3);
  });
});
