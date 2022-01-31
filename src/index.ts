import "./style.css";

import * as _ from "lodash";

import printMe from "./print";

function toUpperCase(input: string): string {
    return input.toUpperCase();
}

function component(): HTMLDivElement {
    const element = document.createElement("div");

    // Lodash, now imported by this script
    element.innerHTML = _.join([toUpperCase("Hello"), "webpack", "!!!"], " ");
    element.classList.add("hello");

    const btn = document.createElement("button");
    btn.innerHTML = "Click me and check the console!";
    btn.onclick = printMe;

    element.appendChild(btn);

    return element;
}

document.body.appendChild(component());
