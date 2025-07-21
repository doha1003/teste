const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'main': './js/main.js',
    'analytics': './js/analytics.js',
    'error-handler': './js/error-handler.js',
    'gemini-api': './js/gemini-api.js'
  },
  output: {
    path: path.resolve(__dirname, 'js'),
    filename: '[name].min.js',
    clean: false
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false,
            drop_debugger: true,
            unused: false  // Prevent tree-shaking of unused functions
          },
          mangle: false,  // Disable name mangling to debug
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};