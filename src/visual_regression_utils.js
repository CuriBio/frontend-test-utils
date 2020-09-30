// adapted from https://github.com/byrne-greg/testcafe-visual-regression/blob/master/tests/vrt-util/vrtUtil.js

// const resemble = __non_webpack_require__("resemblejs"); // __non_webpack_require__ adapted from https://stackoverflow.com/questions/39249237/node-cannot-find-module-fs-when-using-webpack
// const path = __non_webpack_require__("path");
// const fs = __non_webpack_require__("fs");
// const ci = __non_webpack_require__("ci-info");

const resemble = require("resemblejs");
const path = require("path");
const fs = require("fs");
const ci = require("ci-info");
const mkdirp = require("mkdirp");
/**
 * Get metadata out of the Testcafe 't' parameter to include in error messages
 *
 * @param {Object} t - The Testcafe test variable
 * @return {Object} A dictionary where the values are strings.
 */
export function get_testcafe_test_metadata(t) {
  const current_fixture_name = t.testRun.test.testFile.currentFixture.name;
  const current_test_name = t.testRun.test.name;
  return { fixture_name: current_fixture_name, test_name: current_test_name };
}

/**
 * Determine if the code is running in a Continuous Integration environment or not (created as a separate function to make mocking easier)
 *
 * @return {bool}
 */
export function is_running_in_ci() {
  return ci.isCI;
}

/** Adapted from https://futurestud.io/tutorials/node-js-create-your-custom-error. */
export class BaseScreenshotNotFoundDuringCI extends Error {
  /**
   * Create the error.
   * @param {string} message
   */
  constructor(message) {
    super(message);

    this.name = this.constructor.name;
  }
}

/**
 * Get an absolute path for a screenshot from the relative path given by Testcafe
 *
 * @param {string} screenshot_path - This path assumes that the screenshots flag is: --screenshots path=./tests/e2e/screenshots" and that this file is located in node_modules/@curibio/frontend_test_utils/dist . Likely a better solution would be to make this configurable. There doesn't seem (Eli 4/3/20) to be an easy way to get this value from testcafe itself
 * @param {string} screenshot_type - should be either 'base' or 'actual'
 * @return {string}
 */
function get_absolute_path_for_screenshot(screenshot_path, screenshot_type) {
  let this_path = path.normalize(
    path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "tests",
      "e2e",
      "screenshots", // this is specified in the --screenshots flag passed to testcafe in package.json
      screenshot_path
    )
  );

  this_path += "-" + screenshot_type + ".png";

  const this_dirname = path.dirname(this_path);
  mkdirp.sync(this_dirname);

  return this_path;
}

/**
 * Perform a comparison on two images using ResembleJS and raise an error using Testcafe metadata if a mismatch is detected.
 *
 * @param {Object} t - The Testcafe test variable
 * @param {string} base_absolute_path - Path to the base image
 * @param {string} actual_absolute_path - Path to the actual image image
 * @throws {BaseScreenshotNotFoundDuringCI} All base images should be commited to the repo prior to running tests in Continous Integration.
 * @return {None}
 */
async function compare_images_testcafe(
  t,
  base_absolute_path,
  actual_absolute_path
) {
  await resemble(base_absolute_path)
    .compareTo(actual_absolute_path)
    .outputSettings({
      errorColor: {
        red: 255,
        green: 0,
        blue: 255,
      },
      errorType: "movement",
      transparency: 0.3,
      largeImageThreshold: 2000,
      useCrossOrigin: false,
      outputDiff: true,
    })
    .onComplete(async (data) => {
      if (data.rawMisMatchPercentage > 0) {
        // write a diff image
        fs.writeFileSync(
          path.join(
            path.dirname(actual_absolute_path),
            `${path.basename(
              actual_absolute_path,
              path.extname(actual_absolute_path)
            )}-diff.png`
          ),
          data.getBuffer()
        );

        // fail test
        const test_metadata = get_testcafe_test_metadata(t);
        const current_fixture_name = test_metadata.fixture_name;
        const current_test_name = test_metadata.test_name;

        throw new Error(
          `Visual mismatch detected in test: '${current_fixture_name}/${current_test_name}'. For screenshot '${actual_absolute_path}' Please investigate.`
        );
      }
    });
}

/**
 * Use ResembleJS to determine if images matched or not and create a diff image if no match
 *
 * @param {string} base_absolute_path - Path to the base image
 * @param {string} actual_absolute_path - Path to the actual image image
 * @return {bool}
 */
export async function compare_images(base_absolute_path, actual_absolute_path) {
  let did_images_match = true;
  await resemble(base_absolute_path)
    .compareTo(actual_absolute_path)
    .outputSettings({
      errorColor: {
        red: 255,
        green: 0,
        blue: 255,
      },
      errorType: "movement",
      transparency: 0.3,
      largeImageThreshold: 2000,
      useCrossOrigin: false,
      outputDiff: true,
    })
    .onComplete(async (data) => {
      if (data.rawMisMatchPercentage > 0) {
        // write a diff image
        fs.writeFileSync(
          path.join(
            path.dirname(actual_absolute_path),
            `${path.basename(
              actual_absolute_path,
              path.extname(actual_absolute_path)
            )}-diff.png`
          ),
          data.getBuffer()
        );
        did_images_match = false;
      }
    });
  return Promise.resolve(did_images_match);
}

/**
 * Use Testcafe to perform a visual regression test on an element within the page.
 *
 * @param {Object} t - The Testcafe test variable
 * @param {Selector} selector - An instance of a Testcafe Selector to perform visual regression on.
 * @param {string} screenshot_path - A (relative) path (which will be created in the subfolder of tests/e2e/screenshots) to use to store the screenshots of this test.
 * @throws {BaseScreenshotNotFoundDuringCI} All base images should be commited to the repo prior to running tests in Continous Integration.
 * @return {None}
 */
export async function testcafe_element_visual_regression(
  t,
  selector,
  screenshot_path
) {
  // take actual screenshot
  const actual_screenshot_absolute_path = get_absolute_path_for_screenshot(
    screenshot_path,
    "actual"
  );
  await t.takeElementScreenshot(selector, screenshot_path + "-actual.png");

  const base_screenshot_absolute_path = get_absolute_path_for_screenshot(
    screenshot_path,
    "base"
  );

  const is_base_screenshot_taken = fs.existsSync(base_screenshot_absolute_path);

  if (!is_base_screenshot_taken) {
    if (is_running_in_ci()) {
      const test_metadata = get_testcafe_test_metadata(t);
      const current_fixture_name = test_metadata.fixture_name;
      const current_test_name = test_metadata.test_name;
      return Promise.reject(
        new BaseScreenshotNotFoundDuringCI(
          `No base image found during Continous Integration in test: '${current_fixture_name}/${current_test_name}'. For element screenshot '${base_screenshot_absolute_path}' Please commit base images before running CI.`
        )
      );
    }
    console.log(
      // allow-log
      "No existing base screenshot was detected, so taking a new one: " +
        base_screenshot_absolute_path
    );

    // take base screenshot
    await t.takeElementScreenshot(selector, screenshot_path + "-base.png");
    return;
  }

  await compare_images_testcafe(
    t,
    base_screenshot_absolute_path,
    actual_screenshot_absolute_path
  );
}

/**
 * Use Testcafe to perform a visual regression test on a whole page.
 *
 * @param {Object} t - The Testcafe test variable
 * @param {string} screenshot_path - A (relative) path (which will be created in the subfolder of tests/e2e/screenshots) to use to store the screenshots of this test.
 * @throws {BaseScreenshotNotFoundDuringCI} All base images should be commited to the repo prior to running tests in Continous Integration.
 * @return {None}
 */
export async function testcafe_page_visual_regression(t, screenshot_path) {
  // take actual screenshot
  const actual_screenshot_absolute_path = get_absolute_path_for_screenshot(
    screenshot_path,
    "actual"
  );
  await t.takeScreenshot(screenshot_path + "-actual.png");

  const base_screenshot_absolute_path = get_absolute_path_for_screenshot(
    screenshot_path,
    "base"
  );

  const is_base_screenshot_taken = fs.existsSync(base_screenshot_absolute_path);

  if (!is_base_screenshot_taken) {
    if (is_running_in_ci()) {
      const test_metadata = get_testcafe_test_metadata(t);
      const current_fixture_name = test_metadata.fixture_name;
      const current_test_name = test_metadata.test_name;
      return Promise.reject(
        new BaseScreenshotNotFoundDuringCI(
          `No base image found during Continous Integration in test: '${current_fixture_name}/${current_test_name}'. For page screenshot '${actual_screenshot_absolute_path}' Please commit base images before running CI.`
        )
      );
    }
    console.log(
      // allow-log
      "No existing base screenshot was detected, so taking a new one: " +
        base_screenshot_absolute_path
    );

    // take base screenshot
    await t.takeScreenshot(screenshot_path + "-base.png");
    return;
  }

  await compare_images_testcafe(
    t,
    base_screenshot_absolute_path,
    actual_screenshot_absolute_path
  );
}

/**
 * Use Testcafe to perform a visual regression test on a whole page. Returns false if images don't match.
 *
 * @param {Object} browser_window - The Spectron browserWindow object (app.browserWindow)
 * @param {string} screenshot_path - A (relative) path (which will be created in the subfolder of tests/e2e/screenshots) to use to store the screenshots of this test.
 * @param {Object} rectangle_to_capture - An object to pass to the capturePage function of TestCafe
 * @throws {BaseScreenshotNotFoundDuringCI} All base images should be commited to the repo prior to running tests in Continous Integration.
 * @return {bool}
 */
export async function spectron_page_visual_regression(
  browser_window,
  screenshot_path,
  rectangle_to_capture = {}
) {
  // take actual screenshot
  const actual_screenshot_absolute_path = get_absolute_path_for_screenshot(
    screenshot_path,
    "actual"
  );
  const image_buffer = await browser_window.capturePage(rectangle_to_capture);

  fs.writeFileSync(actual_screenshot_absolute_path, image_buffer);

  const base_screenshot_absolute_path = get_absolute_path_for_screenshot(
    screenshot_path,
    "base"
  );

  const is_base_screenshot_taken = fs.existsSync(base_screenshot_absolute_path);

  if (!is_base_screenshot_taken) {
    if (is_running_in_ci()) {
      return Promise.reject(
        new BaseScreenshotNotFoundDuringCI(
          `No base image found during Continous Integration for Spectron page screenshot '${actual_screenshot_absolute_path}' Please commit base images before running CI.`
        )
      );
    }
    console.log(
      // allow-log
      "No existing base screenshot was detected, so taking a new one: " +
        base_screenshot_absolute_path
    );

    // take base screenshot
    const base_image_buffer = await browser_window.capturePage(
      rectangle_to_capture
    );

    fs.writeFileSync(base_screenshot_absolute_path, base_image_buffer);

    return Promise.resolve(true);
  }

  const do_images_match = await compare_images(
    base_screenshot_absolute_path,
    actual_screenshot_absolute_path
  );
  return Promise.resolve(do_images_match);
}
