const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'electron',
  context: path.join(__dirname, '../app'),
  devtool: 'inline-source-map',
  entry: {
    app: [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:9000',
      'webpack/hot/only-dev-server',
      './src/main/index.js'
    ],
  },
  output: {
    path: path.resolve(__dirname, './app/build'),
    filename: 'app.bundle.js',
    publicPath: 'http://localhost:9000/',
  },
  devServer: {
    hot: true,
    publicPath: 'http://localhost:9000/',
    historyApiFallback: true,
    port: 9000,
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    },
    {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    },
    {
      test: /\.(png|jpg|gif)$/,
      use: [{
        loader: 'file-loader',
        options: {},
      }],
    },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new CopyWebpackPlugin([{
      from: './src/main/app.js',
    },
    {
      from: './src/main/index.html',
    },
    ]),
    new webpack.DefinePlugin({
      $dirname: '__dirname',
    }),
  ]
};
