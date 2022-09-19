import { BrowserWindow, Menu } from "electron";

export function addContextMenuHandler(window: BrowserWindow) {
  window.webContents.on("context-menu", (_event, props) => {
    const menu = Menu.buildFromTemplate([
      // https://github.com/electron/fiddle/blob/19360ade76354240630e5660469b082128e1e57e/src/main/context-menu.ts#L113
      {
        id: "inspect",
        label: "Inspect",
        click: () => {
          window.webContents.inspectElement(props.x, props.y);
          if (!window.webContents.isDevToolsOpened()) {
            window.webContents.devToolsWebContents?.focus();
          }
        },
      },
    ]);
    menu.popup({});
  });
}
