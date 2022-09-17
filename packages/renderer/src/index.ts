import "virtual:windi.css";
import React from "react";
import ReactDOM from "react-dom";
import { Root } from "./root";

function main() {
  ReactDOM.render(React.createElement(Root), document.querySelector("#root"));
}

main();
