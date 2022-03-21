/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:07:08
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 16:24:01
 * @Description: file content
 * @FilePath: \my-mini-vue\example\helloworld\App.js
 */
import { h } from "../../lib/guide-mini-vue.esm.js";
export default {
  render() {
    return h("div", "Hi, " + this.msg);
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
