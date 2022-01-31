import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import * as path from "path";
import { fileURLToPath } from "url";

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const config = {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        static: "./dist",
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts"],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Output Management",
        }),
        new ForkTsCheckerWebpackPlugin({
            async: false,
        }),
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(dirName, "dist"),
        clean: true,
    },
};

export default config;
