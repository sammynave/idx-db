import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import visualizer from "rollup-plugin-visualizer";

export default [
  {
    input: "src/index.js",
    external: [],
    output: [
      { file: "index.mjs", format: "esm" },
      { file: "index.js", format: "cjs" },
    ],
    plugins: [resolve(), commonjs(), sizeSnapshot(), visualizer()],
  },
];
