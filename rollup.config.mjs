import babel from "rollup-plugin-babel";
/** rollup默认可以导出一个对象，作为打包的配置文件 */
export default {
  /** 打包入口 */
  input: "./src/index.js",
  /** 打包出口 */
  output: {
    file: "./dist/v2sca.js",
    name: "V2sca", // global Vue2sca
    format: "umd", // esm、es6模块、commonjs模块、iife自执行函数、umd（支持commonjs&amd）
    sourcemap: true, // 可以调试代码
  },
  plugins: [
    babel({
      exclude: "node_modules/**", // 排除node_modules的所有模块
    })
  ]
};
