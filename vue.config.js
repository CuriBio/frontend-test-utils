// adapted from https://cli.vuejs.org/guide/build-targets.html#web-component, https://webpack.js.org/concepts/targets/, and https://stackoverflow.com/questions/53841364/how-to-resolve-fs-existssync-is-not-a-function
// const path = require('path')

// more extensive webpack config adapted from https://github.com/webpack/webpack/issues/1599
// const webpack = require("webpack");
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
    // plugins: [
    //   new webpack.IgnorePlugin(/\.(css|less)$/),
    //   new webpack.BannerPlugin('require("source-map-support").install();',
    //                           { raw: true, entryOnly: false }),
    // ],
    devtool: "sourcemap",
  },
};

// module.exports = {
//   configureWebpack: {
//     // target:"node",
//     // externals: {
//     //   // adapted from http://www.matthiassommer.it/software-architecture/webpack-node-modules/
//     //   fs: "require('fs')",
//     //   path: "require('path')"
//     //   //resemblejs: "require('resemblejs')"
//     // }
//     //     module: {
//     //   rules: [
//     //     { test: /\.txt$/, use: 'raw-loader' }
//     //   ]
//     // },
//     // target: 'node',
//     // output: {
//     //   path: path.resolve(__dirname, 'dist'),
//     //   filename: 'lib.node.js'
//     // },
//     // externals : { canvas: {} }
//   }
// };
