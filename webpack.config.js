import * as path from 'path';
import { fileURLToPath } from 'url'
import HtmlWebpackPlugin from 'html-webpack-plugin';


const fileName = fileURLToPath(import.meta.url)
const dirName = path.dirname(fileName)

const config = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  entry: {
    index: './src/index.js',
    print: './src/print.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Output Management',
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(dirName, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

export default config;
