/*
 * @Author: ZhangJiaSong
 * @Date: 2022-03-21 15:07:08
 * @LastEditors: ZhangJiaSong
 * @LastEditTime: 2022-03-21 15:10:09
 * @Description: file content
 * @FilePath: \my-mini-vue\example\helloworld\App.js
 */
export const App={
    

    render(){
        return h("div","Hi, "+this.msg)
    },
    setup(){

        return{
            msg:'mini-vue'
        }
    }
}