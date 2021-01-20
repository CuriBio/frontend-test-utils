// confirm files import without error from dist package
import {
  get_x_axis_ticks_with_text, // eslint-disable-line no-unused-vars
  get_y_axis_ticks_with_text, // eslint-disable-line no-unused-vars
  get_waveform_line_pixel_coordinates_from_svg, // eslint-disable-line no-unused-vars
  convert_waveform_line_pixel_coordinates_to_expected_data as dist_convert_waveform_line_pixel_coordinates_to_expected_data, // eslint-disable-line no-unused-vars
} from "../../dist/frontend-test-utils.common";

import { convert_waveform_line_pixel_coordinates_to_expected_data } from "@/src/waveform_utils";

describe("waveform_test_utils", () => {
  test("When initial import statements are run, Then no error is raised", () => {
    // Eli (4/7/20) there was a case where a package using this one didn't have "@vue/cli-service": "^3.11.0" installed. The hope was that this test would check for that...but apparently not because @vue/cli-service is already installed in this repo...
    expect(true).toStrictEqual(true);
  });
  describe("convert_waveform_line_pixel_coordinates_to_expected_data", () => {
    test("a typical set of geometry properties for the D3 canvas, When sample data is passed in, Then it correctly calculates the original coordinates", () => {
      const geometry = {
        y_min: 0,
        y_max: 500,
        x_axis_min: 108002,
        x_axis_sample_length: 100000,
        plot_area_pixel_width: 370,
        plot_area_pixel_height: 360,
      };

      const pixel_coords = [
        // sample pixel coordinates -- there is nothing special about these data
        [-0.0073999999999663215, 327.5415086832],
        [51.792599999999986, 289.1952830592],
        [73.9926, 262.479317112],
        [85.0926, 243.534499488],
        [107.29260000000002, 211.60946160000003],
        [181.2926, 117.72587246399998],
        [184.99259999999998, 114.81347700000002],
        [203.49259999999992, 96.02052588000002],
        [251.59259999999998, 83.55028910400002],
        [258.9926, 92.743965792],
        [262.69259999999997, 89.36392082399999],
        [270.0926, 87.56934285599998],
        [295.99259999999987, 111.384407304],
        [314.4925999999999, 126.641580336],
        [381.0925999999999, 213.913555416],
      ];

      const calculated_data_from_pixels = convert_waveform_line_pixel_coordinates_to_expected_data(
        pixel_coords,
        geometry
      );
      expect(calculated_data_from_pixels).toHaveLength(15);
      expect(calculated_data_from_pixels[0][0]).toBeCloseTo(108000, 8);
      expect(calculated_data_from_pixels[0][1]).toBeCloseTo(45.08123794, 4);
      expect(calculated_data_from_pixels[14][0]).toBeCloseTo(211000, 8);
      expect(calculated_data_from_pixels[14][1]).toBeCloseTo(202.8978397, 4);
    });
  });
});
