/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:07:00
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 18:03:35
 * @Description: file content
 * @FilePath: \my-mini-vue\example\helloworld\main.js
 */
import { createApp } from "../../lib/guide-mini-vue.esm.js";
import App from "./App.js";
let root = document.querySelector("#app");
console.log(root,111111111111111111111);
createApp(App).mount(root);
