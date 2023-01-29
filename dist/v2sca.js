(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.V2sca = factory());
})(this, (function () { 'use strict';

  /**
   * 初始化状态
   * @param {*} vm v2sca实例
   */
  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
  }

  /**
   * 初始化数据
   * @param {*} vm v2sca实例
   */
  function initData(vm) {
    // data有可能是函数 || 对象
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    console.log(data, "哈哈哈");
  }

  /**
   * 增加init方法
   * @param {*} V2sca V2sca
   */
  function initMixin(V2sca) {
    V2sca.prototype._init = function (options) {
      // 使用vue的时候会有很多类似$xx的变量，$ref,$data,$nexttick，所有以$开头的，都认为是自己的属性。
      var vm = this;
      // 将用户的选项挂载实例上
      vm.$options = options;

      // 初始化状态
      initState(vm);
    };
  }

  /**
   * V2sca
   * @param {*} options 用户选项
   */
  function V2sca(options) {
    this._init(options);
  }
  initMixin(V2sca);

  return V2sca;

}));
//# sourceMappingURL=v2sca.js.map
