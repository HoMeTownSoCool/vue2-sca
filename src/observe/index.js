import { newArrayProto } from "./array";

class Observer {
  constructor(data) {
    // 将__ob__变成不可枚举
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });
    if (Array.isArray(data)) {
      // 这里我们可以重写数组中的方法，7个变异方法，但是需要保留数组原有的方法，并且可以重写部分

      data.__proto__ = newArrayProto;

      this.observerArray(data);
    } else {
      // Object.defineProperty只能劫持已经存在的属性，后增加的或者删除的，劫持不了
      // 这就是为什么会出现$set 和 $delete这些api的原因
      this.walk(data);
    }
  }
  /** 循环对象，对属性依次劫持 */
  walk(data) {
    // 重新定义属性
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  /** 观测数组 */
  observerArray(data) {
    data.forEach((item) => observe(item));
  }
}

export function defineReactive(target, key, value) {
  // 闭包 属性劫持
  // 走到递归，对所有的对象进行劫持
  observe(value);
  Object.defineProperty(target, key, {
    get() {
      // 取值的时候，会执行
      return value;
    },
    set(newValue) {
      // 修改的时候，会执行
      if (newValue === value) return;
      // 对用户传过来的数据进行再次代理
      observe(newValue);
      value = newValue;
    },
  });
}

export function observe(data) {
  // 对这个对象进行劫持
  if (typeof data !== "object" || data === null) {
    return; // 只对对象进行劫持
  }
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }

  // 如果一个对象被劫持过了，那就不需要再劫持了（需要判断一个对象是不是被接触过，用实例来判断）

  return new Observer(data);
}
