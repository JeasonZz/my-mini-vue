import {
  h,
  ref,
  nextTick,
  getCurrentInsrance,
} from "../../lib/guide-mini-vue.esm.js";
import { Child } from "./Child.js";
export const App = {
  name: "App",
  setup() {
    const count = ref(1);
    let instance = getCurrentInsrance();

    function onClick() {
      for (let i = 0; i < 100; i++) {
        console.log("update111111111");
        count.value = i;
      }
      console.log(instance);
      nextTick(() => {
        console.log(instance);
      });
    }

    return {
      count,
      onClick,
    };
  },

  render() {
    return h("div", {}, [
      h("div", {}, "你好"),
      h("button", { onClick: this.onClick }, "update"),
      h("p", {}, "count=" + this.count),
    ]);
  },
};
