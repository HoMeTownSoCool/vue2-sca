import { observe } from "./observe/index";

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

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(newValue) {
      vm[target][key] = newValue;
    },
  });
}

/**
 * 初始化数据
 * @param {*} vm v2sca实例
 */
function initData(vm) {
  // data有可能是函数 || 对象
  let data = vm.$options.data;
  data = typeof data === "function" ? data.call(vm) : data;

  vm._data = data;
  // 对数据进行劫持，vue2里采用了一个api defineProperty
  observe(data);

  // 对数据进行代理， 将vm._data 用vm来代理就行了
  for (const key in data) {
    proxy(vm, "_data", key);
  }
}
