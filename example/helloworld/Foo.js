import { h } from "../../lib/guide-mini-vue.esm.js";
export default {
  setup(props) {
    console.log(props.count);
    props.count++;
    console.log(props.count);
  },
  render() {
    return h("div", {}, "foo_count:" + this.count);
  },
};
