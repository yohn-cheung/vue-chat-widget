const path = require('path');
const webpack = require('webpack');
var copyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
var fs = require("fs");
const bundleOutputDir = './dist';

module.exports = (env) => {
    const isDevBuild = !(env && env.prod); 

    return [{
        devtool: 'source-map',
        entry: './src/index.js',
        output: {
            filename: 'widget.js',
            path: path.resolve(bundleOutputDir),
        },
        devServer: {
            contentBase: bundleOutputDir
        },
        plugins: isDevBuild
            ? [new webpack.SourceMapDevToolPlugin(), new copyWebpackPlugin({ patterns: [{ from: 'dev/'}]})]
            : [new webpack.BannerPlugin(fs.readFileSync('./LICENSE', 'utf8'))],
            optimization: {
                minimizer: true,
                minimizer: [
                    new TerserPlugin({
                      cache: true,
                      parallel: true,
                      sourceMap: true, // Must be set to true if using source-maps in production
                      terserOptions: {
                        output: {
                          comments: /(Simac|Triangle)/g,
                        },
                      },
                      extractComments: false
                    }),
                  ]
            },
            mode: isDevBuild ? 'development' : 'production',
            module: {
                rules: [
                    { test: /\.html$/i, use: 'html-loader' },
                    { test: /\.css$/i, use: ['style-loader', 'css-loader' + (isDevBuild ? '' : '?minimize')] },
                    {
                        test: /\.js$/i, exclude: /node_modules/, use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/env', {
                                    'targets': {
                                        'browsers': ['ie 6', 'safari 7']
                                    }
                                }]]
                            }
                        }
                    },
                    { test: /\.s[ac]ss$/i, 
											use: [
                                                'style-loader',
                                                'css-loader',
                                                'sass-loader'
											]
							
					},
				    {test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,loader: 'file-loader?limit=100000'}
                ]
            }
    }]
    
};