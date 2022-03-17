/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-17 15:48:06
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-17 15:49:30
 * @Description: file content
 * @FilePath: \my-mini-vue\src\reactivity\tests\shallowReadonly.ts
 */
import { isReadonly, shallowReadonly } from "../reactivity";

describe("shallowReadonly", () => {
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });

  it("should call console.warn when set", () => {
    console.warn = jest.fn();
    const user = shallowReadonly({
      age: 10,
    });

    user.age = 11;
    expect(console.warn).toHaveBeenCalled();
  });
});
