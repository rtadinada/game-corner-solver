import "./css/style.css";

import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

import printMe from "./tsx/print";

ReactDOM.render(
    <React.StrictMode>
        <div className="hello">Hello!</div>
        <button onClick={printMe}>ClickMe</button>
    </React.StrictMode>,
    document.getElementById("root") // see index.html
);
