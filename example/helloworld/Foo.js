import { h } from "../../lib/guide-mini-vue.esm.js";
export default {
  setup(props, { emit }) {
    console.log(props.count);
    props.count++;
    console.log(props.count);
    const emitAdd = () => {
      emit("Add", "AddSucess");
      emit("add", "add");
      emit("AddCount", 10);
      emit("addCount", 11);
      emit("add-count", 12);
    };
    return {
      emitAdd,
    };
  },
  render() {
    const btn = h("button", { onClick: this.emitAdd }, "AddBtn");
    return h("div", {}, [btn]);
    // return h("div", {}, "foo_count:" + this.count);
  },
};
