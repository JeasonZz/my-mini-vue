/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:52:47
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 15:56:15
 * @Description: file content
 * @FilePath: \my-mini-vue\rollup.config.js
 */
import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";
export default {
  input: "./src/index.ts",
  output: [
    {
      format: "cjs",
      file: pkg.main,
    },
    {
      format: "es",
      file: pkg.module,
    },
  ],
  plugins: [typescript()],
};
