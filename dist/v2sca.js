(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.V2sca = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  // 我希望能重写数组中的部分方法
  var oldArrayProto = Array.prototype; // 获取数组的原型

  // newArrayProto.__proto__ = oldArrayProto
  var newArrayProto = Object.create(oldArrayProto);
  // 找到所有的变异方法, content/slice都会不改变原来的数组
  var methods = ["push", "pop", "shift", "unshift", "reverse", "splice", "sort"];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, agrs = new Array(_len), _key = 0; _key < _len; _key++) {
        agrs[_key] = arguments[_key];
      }
      // 这里重写了数组的方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(agrs)); // 内部调用原来的方法，函数的劫持， 切片编程
      // 此时，还需要对新增的数据再次进行劫持
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case "push":
        case "unshift":
          inserted = agrs;
          break;
        case "splice":
          inserted = agrs.slice(2);
          break;
      }
      if (inserted) {
        // 对新增的内容进行观测
        ob.observerArray(inserted);
      }
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // 将__ob__变成不可枚举
      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false
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
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
      /** 观测数组 */
    }, {
      key: "observerArray",
      value: function observerArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observer;
  }();
  function defineReactive(target, key, value) {
    // 闭包 属性劫持
    // 走到递归，对所有的对象进行劫持
    observe(value);
    Object.defineProperty(target, key, {
      get: function get() {
        // 取值的时候，会执行
        return value;
      },
      set: function set(newValue) {
        // 修改的时候，会执行
        if (newValue === value) return;
        // 对用户传过来的数据进行再次代理
        observe(newValue);
        value = newValue;
      }
    });
  }
  function observe(data) {
    // 对这个对象进行劫持
    if (_typeof(data) !== "object" || data === null) {
      return; // 只对对象进行劫持
    }

    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    }

    // 如果一个对象被劫持过了，那就不需要再劫持了（需要判断一个对象是不是被接触过，用实例来判断）

    return new Observer(data);
  }

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
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  /**
   * 初始化数据
   * @param {*} vm v2sca实例
   */
  function initData(vm) {
    // data有可能是函数 || 对象
    var data = vm.$options.data;
    data = typeof data === "function" ? data.call(vm) : data;
    vm._data = data;
    // 对数据进行劫持，vue2里采用了一个api defineProperty
    observe(data);

    // 对数据进行代理， 将vm._data 用vm来代理就行了
    for (var key in data) {
      proxy(vm, "_data", key);
    }
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
