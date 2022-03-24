/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:07:08
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:14:07
 * @Description: file content
 * @FilePath: \my-mini-vue\example\helloworld\App.js
 */
import {
  h,
  createTextNode,
  getCurrentInsrance,
  provide,
  inject,
} from "../../lib/guide-mini-vue.esm.js";

const Foo = {
  setup() {
    provide("age", 18);
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h(FooTwo)]);
  },
};
const FooTwo = {
  setup() {
    const iValue = inject("age");
    provide("bar", "barTwo");
    return {
      iValue,
    };
  },
  render() {
    return h("p", {}, [h("p", {}, this.iValue + ""), h(Consumer)]);
  },
};
const Consumer = {
  setup() {
    const iValue = inject("age");
    const bar = inject("bar");
    return {
      iValue,
      bar,
    };
  },
  render() {
    return h("p", {}, [h("p", {}, this.iValue + "-" + this.bar)]);
  },
};
export default {
  render() {
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      [h(Foo)]
    );
  },
  setup() {
    // console.log(getCurrentInsrance());
    return {
      msg: "mini-vue111",
    };
  },
};
