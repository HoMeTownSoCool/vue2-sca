/**
 * 初始化状态
 * @param {*} vm v2sca实例
 */
export function initState(vm) {
    const opts = vm.$options;
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
    let data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data
    console.log(data, "哈哈哈");
  }