/** @type {import('electron-builder').Configuration} */
const CONFIG = {
  directories: {
    output: "build",
  },
  files: ["packages/**/build/**"],
  // prevent electron-builder implicitly tries to publish on CI
  publish: null,
  // https://www.electron.build/configuration/appimage
  linux: {
    target: "AppImage",
  },
  appImage: {
    desktop: {
      Name: "Toy Process Manager",
    },
  },
};

module.exports = CONFIG;
