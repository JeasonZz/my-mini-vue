/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:07:08
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 17:44:39
 * @Description: file content
 * @FilePath: \my-mini-vue\example\helloworld\App.js
 */
import { h } from "../../lib/guide-mini-vue.esm.js";
export default {
  render() {
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      [
        h(
          "p",
          {
            class: "red",
          },
          "Hi"
        ),
        h(
          "p",
          {
            class: "blue",
          },
          "mini-vue"
        ),
      ]
    );
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
