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
} from "../../lib/guide-mini-vue.esm.js";
import Foo from "./Foo.js";
export default {
  render() {
    // const Fooo = h(Foo, {}, h("p", {}, "123123123"));
    const Fooo = h(
      Foo,
      {},
      {
        header: (age) => {
          return [
            h("div", {}, "header age=" + age),
            createTextNode("啊实打实大所"),
          ];
        },
        footer: (age) => {
          return h("div", {}, "footer age=" + age);
        },
      }
    );
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      [Fooo]
    );
  },
  setup() {
    console.log(getCurrentInsrance());
    return {
      msg: "mini-vue111",
    };
  },
};
