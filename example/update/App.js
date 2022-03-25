/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:07:08
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-22 10:14:07
 * @Description: file content
 * @FilePath: \my-mini-vue\example\helloworld\App.js
 */
import { h, ref } from "../../lib/guide-mini-vue.esm.js";
export default {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        ...this.myProps,
        // onClick: () => {
        //   console.log("click");
        // },
        // onMousedown: () => {
        //   console.log("downdown");
        // },
      },
      [
        h("p", {}, "count: " + this.count),
        h("button", { onClick: this.clickEvent }, "add"),
        h("button", { onClick: this.onChangePropsDemo1 }, "changePropsValue"),
        h("button", { onClick: this.onChangePropsDemo2 }, "deletePropsValue"),
        h("button", { onClick: this.onChangePropsDemo3 }, "changePropsObject"),
      ]
    );
  },
  setup() {
    let count = ref(0);
    const clickEvent = () => {
      count.value++;
    };

    const myProps = ref({
      foo: "foo",
      bar: "bar",
    });

    const onChangePropsDemo1 = () => {
      myProps.value.foo = "new-foo";
    };
    const onChangePropsDemo2 = () => {
      myProps.value.bar = undefined;
    };
    const onChangePropsDemo3 = () => {
      myProps.value = {
        foo: "foo",
      };
    };
    return {
      count,
      myProps,
      clickEvent,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
    };
  },
};
