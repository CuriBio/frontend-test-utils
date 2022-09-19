module.exports = {
  setupFilesAfterEnv: ["<rootDir>/src/jest.setup-failure-on-warnings.js"], // (Eli 3/2/20) adapted from https://medium.com/@chris.washington_60485/vue-jest-properly-catch-unhandledpromiserejectionwarning-and-vue-warn-errors-in-jest-unit-tests-fcc45269146b
  moduleNameMapper: {
    // we can use "@/components/item.vue" to access components in a simpler way
    "^@/(.*)$": "<rootDir>/$1",
  },
  // the file types we want jest to accept
  moduleFileExtensions: ["js", "json", "ts", "tsx"],
  modulePathIgnorePatterns: ["<rootDir>/dist"],
  // the files Jest should seach for
  testRegex: "tests/.*.spec.js",

  // transformations we want jest to apply
  transform: {
    // process js files with jest
    "^.+\\.js$": "babel-jest",
    // process assets with transform stub
    ".+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
  },
  // we will use this to create snapshot tests
  snapshotSerializers: ["jest-serializer-vue"],
  // used for jsdom to mimic a real browser with a real url
  testURL: "http://localhost/",
  // we should collect coverage
  collectCoverage: true,
  // collectCoverageFrom: [ 'src/**/*.{js}' ],
  // set a directory for coverage cache
  coverageDirectory: "<rootDir>/tests/__coverage__",

  // test logging
  testResultsProcessor: "./node_modules/jest-html-reporter",

  // set patterns to ignore for coverage
  coveragePathIgnorePatterns: ["/node_modules", "test_utils", ".nuxt"],
};
