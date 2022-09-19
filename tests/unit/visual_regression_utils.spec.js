// confirm files import without error from dist package
import {
  dist_testcafe_page_visual_regression, // eslint-disable-line no-unused-vars
  dist_testcafe_element_visual_regression, // eslint-disable-line no-unused-vars
  dist_BaseScreenshotNotFoundDuringCI, // eslint-disable-line no-unused-vars
  dist_is_running_in_ci, // eslint-disable-line no-unused-vars
  dist_get_testcafe_test_metadata, // eslint-disable-line no-unused-vars
  dist_spectron_page_visual_regression, // eslint-disable-line no-unused-vars
} from "@/dist/frontend-test-utils.common";
const mkdirp = require("mkdirp");
const fs = require("fs");
const path = require("path");
const sinon = require("sinon");
import {
  testcafe_page_visual_regression,
  spectron_page_visual_regression,
  testcafe_element_visual_regression,
  BaseScreenshotNotFoundDuringCI,
  compare_images,
  // get_testcafe_test_metadata,
} from "@/src/visual_regression_utils";

const ci = require("ci-info");
const resemble = require("resemblejs");
const sandbox = sinon.createSandbox({
  useFakeTimers: false, // Eli (6/14/20): fakeTimers can mess with Jest's builtin timers for timeouts for the tests. If you need to fake things about time, do so carefully, such as with sandbox.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
});
describe("visual_regression_utils", () => {
  afterEach(() => {
    sandbox.restore();
  });
  describe("Given mkdirp is stubbed to not actually attempt to make a real directory", () => {
    beforeEach(() => {
      sandbox.stub(mkdirp, "sync");
    });
    describe("Given resemble and fs.writeFileSync, and browserWindow.capturePage are stubbed and system believes it is NOT running in Continuous Integration (so errors won't be thrown when base images don't exist)", () => {
      let mocked_capture_page;
      let mocked_spectron_browser_window;
      beforeEach(() => {
        const stubbed_ci_info = sandbox.stub(ci);
        stubbed_ci_info.isCI = false;

        sandbox.stub(fs, "writeFileSync");

        mocked_spectron_browser_window = {
          capturePage: jest.fn(),
        };
        mocked_capture_page = mocked_spectron_browser_window.capturePage;
      });
      afterEach(() => {
        mocked_spectron_browser_window = null;
        mocked_capture_page = null;
        // resemble.restore() // Eli (6/14/20): not sure why this is needed...sandbox.restore() is supposed to already take care of this...but without it "Attempted to wrap compare which is already wrapped" error occurs
        // sandbox.restore();
      });

      test("When no extra rectangle coordinates are supplied, Then spectron_page_visual_regression calls capturePage with an empty object", async () => {
        sandbox.stub(resemble); // Eli (6/14/20): not sure why this is can't be in the beforeEach section...sandbox.restore() is supposed to already take care of this...but without it "Attempted to wrap compare which is already wrapped" error occurs
        await expect(
          spectron_page_visual_regression(mocked_spectron_browser_window, "my-screenshot-path")
        ).resolves.toBe(true); // must await the expect for async functions https://github.com/facebook/jest/issues/5538
        expect(mocked_capture_page).toHaveBeenCalledTimes(2);
        expect(mocked_capture_page).toHaveBeenNthCalledWith(1, {});
        expect(mocked_capture_page).toHaveBeenNthCalledWith(2, {});
      });
      test("When extra rectangle coordinates are supplied, Then spectron_page_visual_regression calls capturePage with those rectangle coordinates", async () => {
        const expected_rectangle = { x: 3, y: 4, width: 6, height: 80 };

        await expect(
          spectron_page_visual_regression(
            mocked_spectron_browser_window,
            "my-screenshot-path",
            expected_rectangle
          )
        ).resolves.toBe(true); // must await the expect for async functions https://github.com/facebook/jest/issues/5538
        expect(mocked_spectron_browser_window.capturePage).toHaveBeenCalledTimes(2);
        expect(mocked_spectron_browser_window.capturePage).toHaveBeenNthCalledWith(1, expected_rectangle);
        expect(mocked_spectron_browser_window.capturePage).toHaveBeenNthCalledWith(2, expected_rectangle);
      });
    });

    describe("Given system believes it is running in a Continuous Integration environment", () => {
      beforeEach(() => {
        const stubbed_ci_info = sandbox.stub(ci);
        stubbed_ci_info.isCI = true;
      });
      test("When no base image is available, Then testcafe_page_visual_regression throws an error", async () => {
        const mocked_testcafe = {
          takeScreenshot: jest.fn(),
          testRun: {
            test: { name: jest.fn(), testFile: { currentFixture: jest.fn() } },
          },
        };

        await expect(testcafe_page_visual_regression(mocked_testcafe, "my-screenshot-path")).rejects.toThrow(
          BaseScreenshotNotFoundDuringCI
        ); // must await the expect for async functions https://github.com/facebook/jest/issues/5538
      });
      test("When no base image is available, Then testcafe_element_visual_regression throws an error", async () => {
        const mocked_testcafe = {
          takeElementScreenshot: jest.fn(),
          testRun: {
            test: { name: jest.fn(), testFile: { currentFixture: jest.fn() } },
          },
        };

        const dummy_element = {};
        await expect(
          testcafe_element_visual_regression(mocked_testcafe, dummy_element, "my-screenshot-path")
        ).rejects.toThrow(BaseScreenshotNotFoundDuringCI); // must await the expect for async functions https://github.com/facebook/jest/issues/5538
      });
      test("When no base image is available, Then spectron_page_visual_regression throws an error", async () => {
        sandbox.stub(fs, "writeFileSync");

        const mocked_spectron_browser_window = {
          capturePage: jest.fn(),
        };

        await expect(
          spectron_page_visual_regression(mocked_spectron_browser_window, "my-screenshot-path")
        ).rejects.toThrow(BaseScreenshotNotFoundDuringCI); // must await the expect for async functions https://github.com/facebook/jest/issues/5538
      });
    });
  });

  describe("compare_images", () => {
    const base_image_path = path.join(__dirname, "images", "plate-barcode.png");
    const duplicate_image_path = path.join(__dirname, "images", "plate-barcode-copy.png");
    const mismatched_image_path = path.join(__dirname, "images", "plate-barcode-redbox.png");
    test("When two images are identical, Then it resolves to true", async () => {
      const result_of_comparison = compare_images(base_image_path, duplicate_image_path);
      await expect(result_of_comparison).resolves.toBe(true);
    });
    test("When two images are mismatched, Then it resolves to be false and creates diff image", async () => {
      const stubbed_write_file_sync = sandbox.stub(fs, "writeFileSync");

      const result_of_comparison = compare_images(base_image_path, mismatched_image_path);

      await expect(result_of_comparison).resolves.toBe(false);

      expect(stubbed_write_file_sync.getCalls()[0].args[0]).toStrictEqual(
        path.join(__dirname, "images", "plate-barcode-redbox-diff.png")
      );
    });
  });
});
