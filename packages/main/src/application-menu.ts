import { Menu, shell } from "electron";
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
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}
