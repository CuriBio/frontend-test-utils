/*
  This module cannot contain any external libraries!
 */
let engines;

try {
  engines = require("../../package");
} catch (e) {
  if (e.code !== "MODULE_NOT_FOUND") {
    // Re-throw not "Module not found" errors
    throw e;
  }
  try {
    engines = require("../../../package");
  } catch (e) {
    if (e.code !== "MODULE_NOT_FOUND") {
      // Re-throw not "Module not found" errors
      throw e;
    }
    try {
      engines = require("../../../../package");
    } catch (e) {
      if (e.code !== "MODULE_NOT_FOUND") {
        // Re-throw not "Module not found" errors
        throw e;
      }
      engines = require("../../../../package");
    }
  }
}

const RESET = "\x1b[0m";
const FG_RED = "\x1b[31m";

/**
 * Checks if the version of node active on the machine matches the allowed versions in package.json
 *
 * @throws {Error} Invalid node version
 */
function check_node_version() {
  if (engines.node === undefined) return;
  const requiredMinVersion = engines.node.replace(/[=<>]/g, "");
  const installedVersion = process.versions.node;
  if (compare(requiredMinVersion, installedVersion) === 1) {
    console.log(FG_RED); // allow-log
    console.log(
      // allow-log
      `\tYou are running version v${installedVersion} of Node.js, which is not supported by Electron-nuxt.`
    );
    console.log(
      // allow-log

      `\tThe official Node.js version that is supported is ${requiredMinVersion} or greater.`
    );
    console.log(RESET); // allow-log
    console.log(
      // allow-log

      "\n\tPlease visit https://nodejs.org/en/ to find instructions on how to update Node.js.\n"
    );

    throw new Error("Invalid node version");
  }
}

/**
 * Compare software version numbers. Based on https://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
 *
 * @param {string} a - First version to compare
 * @param {string} b - Second version to compare
 * @return {int} 1 if a > b, -1 if a < b, 0 if a == b
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  const a_components = a.split(".");
  const b_components = b.split(".");

  const len = Math.min(a_components.length, b_components.length);

  // loop while the components are equal
  for (let i = 0; i < len; i++) {
    // A bigger than B
    if (parseInt(a_components[i]) > parseInt(b_components[i])) {
      return 1;
    }

    // B bigger than A
    if (parseInt(a_components[i]) < parseInt(b_components[i])) {
      return -1;
    }
  }

  // If one's a prefix of the other, the longer one is greater.
  if (a_components.length > b_components.length) {
    return 1;
  }

  if (a_components.length < b_components.length) {
    return -1;
  }

  // Otherwise they are the same.
  return 0;
}

try {
  check_node_version();
  process.exit(0);
} catch (e) {
  process.exit(1);
}
