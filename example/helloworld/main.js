/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:07:00
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 16:22:54
 * @Description: file content
 * @FilePath: \my-mini-vue\example\helloworld\main.js
 */
import { createApp } from "../../lib/guide-mini-vue.esm.js";
import App from "./App.js";
let root = document.querySelectorAll("#app");
createApp(App).mount(root);
