import { Menu, dialog, shell } from "electron";
import { promptAutoUpdate } from "./auto-update";
import { CONFIG_PATH } from "./types";

export function createApplicationMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open Config File",
          click: () => {
            shell.openPath(CONFIG_PATH);
          },
        },
        { role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Check Updates",
          click: async () => {
            try {
              await promptAutoUpdate();
            } catch (e) {
              console.error("failed to auto update", e);
              dialog.showErrorBox("failed to auto update", String(e));
            }
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}
