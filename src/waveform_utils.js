const parse_svg_d_path = require("d-path-parser");

/**
 * Get the text values for the ticks along the x-axis from a d3 SVG within a Component in the DOM
 *
 * @param {Object} waveform_wrapper - The vue-test-utils wrapper for the waveform component containing the SVG drawing
 * @return {Array} An array of DOM wrappers for the tick elements
 */
export function get_x_axis_ticks_with_text(waveform_wrapper) {
  const ticks_with_text = waveform_wrapper.findAll("#x_axis_node .tick text");
  return ticks_with_text;
}

/**
 * Get the text values for the ticks along the y-axis from a d3 SVG within a Component in the DOM
 *
 * @param {Object} waveform_wrapper - The vue-test-utils wrapper for the waveform component containing the SVG drawing
 * @return {Array} An array of DOM wrappers for the tick elements
 */
export function get_y_axis_ticks_with_text(waveform_wrapper) {
  const ticks_with_text = waveform_wrapper.findAll("#y_axis_node .tick text");
  return ticks_with_text;
}

/**
 * Extract the parsed line path from the SVG d3 object within a Component in the DOM
 *
 * @param {Object} waveform_wrapper - The vue-test-utils wrapper for the waveform component containing the SVG drawing
 * @param {String} element - The name of the element
 * @return {Array} An array of path elements.
 */
export function get_waveform_line_parsed_path(waveform_wrapper, element = "waveform_line_node") {
  const waveform_line_node = waveform_wrapper.find(`#${element}`);
  const waveform_line_path = waveform_line_node.find("path");
  const waveform_line_path_d = waveform_line_path.attributes("d");
  const parsed_path = parse_svg_d_path(waveform_line_path_d);
  return parsed_path;
}

/**
 * Extract pixel line coordinates from a d3 SVG within a Component in the DOM
 *
 * @param {Object} waveform_wrapper - The vue-test-utils wrapper for the waveform component containing the SVG drawing
 * @param {String} element - The name of the element
 * @return {Array} An array of tuples of x/y numerical values for the pixel coordinates of the line
 */
export function get_waveform_line_pixel_coordinates_from_svg(
  waveform_wrapper,
  element = "waveform_line_node"
) {
  const parsed_path = get_waveform_line_parsed_path(waveform_wrapper, element);
  const converted_data = [];
  parsed_path.forEach((element) => {
    const x = element.end.x;
    const y = element.end.y;

    converted_data.push([x, y]);
  });
  return converted_data;
}

/**
 * Take pixel coordinates from a drawing and convert it back to the x/y numerical values that should have been used to generate those pixel coordinates.
 *
 * @param {Object} pixel_coords - A 2D array of x/y pixel coordinates extracted from the D3 drawing ([[x1, y1],[x2,y2]],...)
 * @param {Object} plot_geometry - An object containing various attributes about the geometry of the drawing. Often the nomenclature matches the propsData supplied to Waveform.vue and so propsData can be passed in as this value.
 * @return {Array} A 2D array of the x/y numerical values that should have been used to generate the pixel coordinates (follows same 2D array format as pixel_coords)
 */
export function convert_waveform_line_pixel_coordinates_to_expected_data(pixel_coords, plot_geometry) {
  const plot_area_pixel_height = plot_geometry.plot_area_pixel_height;
  const plot_area_pixel_width = plot_geometry.plot_area_pixel_width;
  const y_min = plot_geometry.y_min;
  const y_max = plot_geometry.y_max;
  const x_length = plot_geometry.x_axis_sample_length;
  const x_offset = plot_geometry.x_axis_min;

  const converted_data = [];
  pixel_coords.forEach((element) => {
    let x = element[0];
    let y = element[1];

    const y_size = y_max - y_min;

    // convert raw y pixel position to fraction of the canvas (and change orientation so origin is bottom left)
    y = (y - plot_area_pixel_height) / -plot_area_pixel_height;
    // convert y fraction to number
    y = y * y_size;
    // adjust based on y_min
    y += y_min;

    // convert raw x pixel position to fraction of the canvas
    x = x / plot_area_pixel_width;
    // convert x fraction to sample idx
    x = x * x_length;
    // adjust based on starting index
    x += x_offset;

    converted_data.push([x, y]);
  });
  return converted_data;
}
