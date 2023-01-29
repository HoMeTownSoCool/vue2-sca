import { observe } from "./index";

// 我希望能重写数组中的部分方法
let oldArrayProto = Array.prototype; // 获取数组的原型

// newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto);
// 找到所有的变异方法, content/slice都会不改变原来的数组
let methods = ["push", "pop", "shift", "unshift", "reverse", "splice", "sort"];

methods.forEach((method) => {
  newArrayProto[method] = function (...agrs) {
    // 这里重写了数组的方法
    const result = oldArrayProto[method].call(this, ...agrs); // 内部调用原来的方法，函数的劫持， 切片编程
    // 此时，还需要对新增的数据再次进行劫持
    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case "push":
      case "unshift":
        inserted = agrs;
        break;
      case "splice":
        inserted = agrs.slice(2);
        break;

      default:
        break;
    }
    if (inserted) {
      // 对新增的内容进行观测
      ob.observerArray(inserted);
    }
    return result;
  };
});
