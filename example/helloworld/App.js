/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:07:08
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:14:07
 * @Description: file content
 * @FilePath: \my-mini-vue\example\helloworld\App.js
 */
import { h } from "../../lib/guide-mini-vue.esm.js";
export default {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      "Hi, " + this.msg
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
