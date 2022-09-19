// adapted from https://medium.com/@chris.washington_60485/vue-jest-properly-catch-unhandledpromiserejectionwarning-and-vue-warn-errors-in-jest-unit-tests-fcc45269146b

// you need this to reformat the console.error
// import { format } from "util";
const format = require("util").format;
process.on("unhandledRejection", (error) => {
  // Will print "unhandledRejection err is not defined"
  console.error("unhandledRejection", error.message);
});

// this call will be set before every test
// eslint-disable-next-line jest/require-top-level-describe
beforeEach(() => {
  // const { error } = global.console;
  global.console.error = (...args) => {
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (typeof arg === "string" && (arg.includes("Vue warn") || arg.includes("unhandledRejection"))) {
        if (!arg.includes("Vue warn]: Error")) {
          // Eli (3/26/20): for some reason if there is an actual error, a lot of the relevant stack trace is lost. so hopefully this still throws errors in actual warnings but allows real errors to be processed normally
          // console.log("throwing error here...the arg was: " + arg);
          throw new Error(format(...args));
          // error(...args);
        }
      }
    }
  };
});
