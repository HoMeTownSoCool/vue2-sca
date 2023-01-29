import { initState } from "./state";
/**
 * 增加init方法
 * @param {*} V2sca V2sca
 */
export function initMixin(V2sca) {
  V2sca.prototype._init = function (options) {
    // 使用vue的时候会有很多类似$xx的变量，$ref,$data,$nexttick，所有以$开头的，都认为是自己的属性。
    const vm = this;
    // 将用户的选项挂载实例上
    vm.$options = options;

    // 初始化状态
    initState(vm);
  };
}
