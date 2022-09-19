/** @type {import('electron-builder').Configuration} */
const CONFIG = {
  directories: {
    output: "build",
  },
  files: ["packages/**/build/**"],
  // https://www.electron.build/configuration/appimage
  linux: {
    target: "AppImage",
  },
  appImage: {
    desktop: {
      Name: "Electron Vite Experiment",
    },
  },
};

module.exports = CONFIG;
