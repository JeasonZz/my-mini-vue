import { h } from "../../lib/guide-mini-vue.esm.js";

export const Child = {
  name: "Child",
  setup() {},
  render() {
    return h("p", {}, "props=" + this.$props.msg);
  },
};
