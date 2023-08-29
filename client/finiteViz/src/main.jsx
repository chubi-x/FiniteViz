import visualise from "../drawMesh";
// import javascriptLogo from "./javascript.svg";
// import $ from "jquery";

import React from "react";
import ReactDOM from "react-dom/client";
import { BaseMesh } from "./BaseMesh";
import "./style.css";

ReactDOM.createRoot(document.getElementById("baseMesh")).render(
  <React.StrictMode>
    <BaseMesh />
  </React.StrictMode>
);
visualise();

