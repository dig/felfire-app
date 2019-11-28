const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { spawn } = require('child_process');
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
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
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
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  devtool: 'cheap-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, './app/build'),
    stats: {
      colors: true,
      chunks: false,
      children: false
    },
    before() {
      spawn(
        'electron',
        ['.'],
        { shell: true, env: process.env, stdio: 'inherit' }
      )
      .on('close', code => process.exit(0))
      .on('error', spawnError => console.error(spawnError))
    }
  }
}
