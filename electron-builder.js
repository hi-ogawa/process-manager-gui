/** @type {import('electron-builder').Configuration} */
const CONFIG = {
  directories: {
    output: "build",
  },
  files: ["packages/**/build/**"],
};

module.exports = CONFIG;
