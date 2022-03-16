/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-16 10:46:23
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-16 10:48:31
 * @Description: file content
 * @FilePath: \my-mini-vue\babel.config.js
 */
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
};
