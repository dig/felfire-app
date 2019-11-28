const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const defaultInclude = path.resolve(__dirname, '../app/src/render');

module.exports = {
  entry: {
    app: [
      './app/src/render/index.js'
    ],
  },
  output: {
    path: path.resolve(__dirname, '../app/build'),
    filename: 'app.bundle.js',
  },
  externals: [{ 
    'electron-store': 'require("electron-store")' 
  }],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ],
        include: defaultInclude
      },
      {
        test: /\.jsx?$/,
        use: [{ loader: 'babel-loader' }],
        include: defaultInclude
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
        include: defaultInclude
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }],
        include: defaultInclude
      }
    ]
  },
  target: 'electron-renderer',
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'app.bundle.css',
      chunkFilename: '[id].css'
    }),
    new CopyWebpackPlugin([
      {
        from: './app/src/main',
        to: path.join(__dirname, '../app/build'),
      },
      {
        from: './app/src/render/index.html',
        to: path.join(__dirname, '../app/build'),
      },
      {
        from: './app/src/render/ui/capture/region/front.html',
        to: path.join(__dirname, '../app/build/region.html'),
      },
      {
        from: './app/src/render/ui/capture/region/front.js',
        to: path.join(__dirname, '../app/build/region.js'),
      },
      {
        from: './app/src/render/ui/capture/video/front.html',
        to: path.join(__dirname, '../app/build/video.html'),
      },
      {
        from: './app/src/render/ui/capture/video/front.js',
        to: path.join(__dirname, '../app/build/video.js'),
      },
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new BabiliPlugin()
  ],
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false
  }
}
