// https://www.electron.build/auto-update
// https://www.electron.build/auto-update#custom-options-instantiating-updater-directly
// https://github.com/electron-userland/electron-builder/blob/dba9cfa73257b4993fac41cea825c73f7d733353/encapsulated%20manual%20update%20via%20menu.js
// https://github.com/electron-userland/electron-builder/blob/d71a5790a94cd56b6e033b656b4892ec31f14b9d/packages/electron-updater/src/providers/GitHubProvider.ts

import { app, dialog } from "electron";
import { AppImageUpdater } from "electron-updater";
import semver from "semver";

// TODO: indicate loading states (update fetch, download progress, etc...)

// ts-prune-ignore-next
export async function promptAutoUpdate() {
  const updater = new AppImageUpdater({
    provider: "github",
    vPrefixedTagName: false,
    owner: "hi-ogawa",
    repo: "toy-process-manager",
  });
  updater.autoDownload = false;

  // check updates by fetching latesta.yml
  const updates = await updater.checkForUpdates();
  const version = updates?.updateInfo.version;
  const currentVersion = app.getVersion();

  if (version && semver.gt(version, currentVersion)) {
    // ask if continue to download and update
    const clicked = await dialog.showMessageBox({
      type: "info",
      title: "New version available",
      message: [
        `Would you like to download?\n`,
        `Current : ${currentVersion}`,
        `Latest : ${version}`,
      ].join("\n"),
      buttons: ["Cancel", "Download"],
    });

    if (clicked.response === 1) {
      updater.on("download-progress", (data) => {
        console.log(`${data.percent}%`);
      });

      // download app
      await updater.downloadUpdate();

      // confirm before restarting the app with a new version
      const clicked = await dialog.showMessageBox({
        type: "info",
        title: "Download finished",
        message: `Would you like to restart and update the app?`,
        buttons: ["Cancel", "Restart"],
      });
      if (clicked.response === 1) {
        updater.quitAndInstall();
      }
    }
  }
}
