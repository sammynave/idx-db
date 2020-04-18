import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default [
  {
    input: "src/index.js",
    external: [],
    output: [
      { file: "index.mjs", format: "esm" },
      { file: "index.js", format: "cjs" },
    ],
    plugins: [resolve(), commonjs()],
  },
];
