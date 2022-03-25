/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:07:08
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:14:07
 * @Description: file content
 * @FilePath: \my-mini-vue\example\helloworld\App.js
 */
import { h, ref } from "../../lib/guide-mini-vue.esm.js";
export default {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
        // onClick: () => {
        //   console.log("click");
        // },
        // onMousedown: () => {
        //   console.log("downdown");
        // },
      },
      [
        h("p", {}, "count: " + this.count),
        h("button", { onClick: this.clickEvent }, "add"),
      ]
    );
  },
  setup() {
    let count = ref(0);
    const clickEvent = () => {
      count.value++;
    };
    return {
      count,
      clickEvent,
    };
  },
};
