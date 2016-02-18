/* global require */
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './components/main/index.js',
  output: {
    path: './public',
    filename: 'assets/bundle.js'
  },

  cache: false,
  clearBeforeBuild: true,

  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      query: {
        cacheDirectory: true,
        presets: ['es2015']
      }
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('style', 'css-loader?minimize!sass')
    }]
  },
  plugins: [
    new ExtractTextPlugin('assets/bundle.css')
  ]
}
