/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:07:08
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:14:07
 * @Description: file content
 * @FilePath: \my-mini-vue\example\helloworld\App.js
 */
import { h } from "../../lib/guide-mini-vue.esm.js";
import Foo from "./Foo.js";
export default {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
        onClick: () => {
          console.log("click");
        },
        onMousedown: () => {
          console.log("downdown");
        },
      },
      [
        h(Foo, {
          count: 1,
          // onAdd(arg) {
          //   console.log("Add", arg);
          // },
          // onAddCount(num) {
          //   console.log("onAddCount", num);
          // },
        }),
      ]
      // "Hi, " + this.msg
      // [
      //   h(
      //     "p",
      //     {
      //       class: "red",
      //     },
      //     "Hi"
      //   ),
      //   h(
      //     "p",
      //     {
      //       class: "blue",
      //     },
      //     "mini-vue"
      //   ),
      // ]
    );
  },
  setup() {
    return {
      msg: "mini-vue111",
    };
  },
};
