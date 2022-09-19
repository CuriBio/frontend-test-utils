#!/usr/bin/env node

/*
  This module cannot contain any external libraries!

  Adapted from:
    - https://github.com/michalzaq12/electron-nuxt/blob/master/template/.electron-nuxt/check-engines.js
    - https://stackoverflow.com/questions/67831958/prevent-npm-start-if-node-version-mismatch
*/

const path = require("path");

const FG_RED = "\x1b[31m";
const RESET = "\x1b[0m";

const errorInRed = (msg) => {
  console.error(FG_RED + msg + RESET);
};

const packageDetails = (() => {
  const packagePath = path.join(process.cwd(), "./package.json");
  try {
    return require(packagePath);
  } catch (e) {
    errorInRed(`Could not find ${packagePath}`);
    process.exit(1);
  }
})();

const engines = packageDetails.engines;

if (!engines || !engines.node) {
  errorInRed("Please define 'engines.node' in package.json");
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
    errorInRed(`Min node version required: v${minNodeVersion}, found: v${currentNodeVersion}`);
    process.exit(1);
  }
  // if the two version components are equal, must check the next version component
});

// if this loop exits, then the current node version is exactly equal to the min required node version
