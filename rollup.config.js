import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

export default [
  {
    input: "src/index.js",
    output: {
      name: "idxDb",
      file: pkg.browser,
      format: "umd",
    },
    plugins: [resolve(), commonjs()],
  },

  {
    input: "src/index.js",
    external: [],
    output: [
      { file: pkg.module, format: "es" },
      { file: pkg.main, format: "cjs" },
    ],
    plugins: [resolve(), commonjs()],
  },
];
