import React from "react";
import ReactDOM from "react-dom";
import VoltorbFlip from "./tsx/VoltorbFlip";

const centerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

ReactDOM.render(
    <React.StrictMode>
        <div style={centerStyle}>
            <VoltorbFlip />
        </div>
    </React.StrictMode>,
    document.getElementById("root") // see index.html
);
