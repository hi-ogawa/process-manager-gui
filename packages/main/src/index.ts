import { app } from "electron";
import { MainApp } from "./main-app";

async function main() {
  await app.whenReady();
  const mainApp = new MainApp();
  await mainApp.initialize();
  await mainApp.start();
}

if (require.main === module) {
  main();
}
