// adapted from https://cli.vuejs.org/guide/build-targets.html#web-component, https://webpack.js.org/concepts/targets/, and https://stackoverflow.com/questions/53841364/how-to-resolve-fs-existssync-is-not-a-function

// more extensive webpack config adapted from https://github.com/webpack/webpack/issues/1599
const path = require("path");
const fs = require("fs");

const node_modules = {};
fs.readdirSync("node_modules")
  .filter(function (x) {
    return [".bin"].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    node_modules[mod] = "commonjs " + mod;
  });

module.exports = {
  configureWebpack: {
    entry: ["./src/index.js"],
    context: __dirname,
    node: {
      __filename: true,
      __dirname: false,
    },
    target: "node",
    output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].bundle.js",
      chunkFilename: "[id].bundle.js",
    },
    externals: node_modules,
    devtool: "sourcemap",
  },
};
