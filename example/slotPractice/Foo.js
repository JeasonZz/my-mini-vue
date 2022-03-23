import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";
export default {
  setup(props, { emit }) {},
  render() {
    const btn = h("p", {}, "iiiiiiiiiii");
    const arr = [
      renderSlots(this.$slots, "header", 10),
      btn,
      renderSlots(this.$slots, "footer", 11),
    ];
    return h("div", {}, arr);
    // return h("div", {}, "foo_count:" + this.count);
  },
};
