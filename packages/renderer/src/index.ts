import "virtual:windi.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./root";

function main() {
  const el = document.querySelector("#root");
  if (!el) {
    throw new Error("invalid #root");
  }
  const root = createRoot(el);
  root.render(React.createElement(Root));
}

main();
