"use strict";
const path = require("path");

module.exports = {
  entry: './src/index.js',
  output: {
    path: './',
    fileName: 'bundle.js',
    publicPath: '/'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: "babel",
      include: [
        path.resolve(__dirname, "src")        
      ]
    }]
  },
  devServer: {
    inline: true,
    port: 4000
  },
  devtool: "source-map",  
};
