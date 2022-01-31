import t from "./test";

export default function printMe(): void {
    console.log("I get called from print.js!");
    t();
}
