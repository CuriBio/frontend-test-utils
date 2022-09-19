/*
  This module cannot contain any external libraries!

  Adapted from:
    - https://github.com/michalzaq12/electron-nuxt/blob/master/template/.electron-nuxt/check-engines.js
    - https://stackoverflow.com/questions/67831958/prevent-npm-start-if-node-version-mismatch
 */

const FG_RED = "\x1b[31m";
const RESET = "\x1b[0m";

const warnInRed = (msg) => {
  console.warn(FG_RED + msg + RESET);
};

const packageDetails = require("./package.json");
const engines = packageDetails.engines;

if (!engines || !engines.node) {
  warnInRed("Please define 'engines.node' in package.json");
  process.exit(1);
}

// assume the version defined is a min requirement
const minNodeVersion = engines.node.replace(/[>=^~]/g, "");
const currentNodeVersion = process.version.replace(/^v/, "");

/*
  Only compare components of version that are defined in engines.node. For example, if no patch version is
  defined, don't need to check the patch version of the actual version of node that is running this script.
 */
minNodeVersion.split(".").forEach((min, idx) => {
  const curr = currentNodeVersion.split(".")[idx];
  if (curr > min) {
    // acceptable node version in use, exit successfully
    process.exit(0);
  } else if (curr < min) {
    warnInRed(`Min node version required: v${minNodeVersion}, found: v${currentNodeVersion}`);
    process.exit(1);
  }
  // if the two version components are equal, must check the next version component
});

// if this loop exits, then the current node version is exactly equal to the min required node version
