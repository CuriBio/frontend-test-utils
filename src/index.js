// adapted from https://github.com/talk-to/vue-components/blob/master/src/index.js

// visual regression
export { testcafe_page_visual_regression } from "./visual_regression_utils";
export { spectron_page_visual_regression } from "./visual_regression_utils";
export { testcafe_element_visual_regression } from "./visual_regression_utils";
export { is_running_in_ci } from "./visual_regression_utils";
export { BaseScreenshotNotFoundDuringCI } from "./visual_regression_utils";
export { get_testcafe_test_metadata } from "./visual_regression_utils";

// D3 pixel coordinate testing

export { get_waveform_line_pixel_coordinates_from_svg } from "./waveform_utils";
export { convert_waveform_line_pixel_coordinates_to_expected_data } from "./waveform_utils";
export { get_x_axis_ticks_with_text } from "./waveform_utils";
export { get_y_axis_ticks_with_text } from "./waveform_utils";
