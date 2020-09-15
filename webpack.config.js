const path = require('path');
const webpack = require('webpack');
var copyWebpackPlugin = require('copy-webpack-plugin');
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
            : [],
            optimization: {
                minimize: !isDevBuild
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
                    { test: /\.s[ac]ss$/i, use: [
                      	// Creates `style` nodes from JS strings
                        'style-loader',
                        // Translates CSS into CommonJS
                        'css-loader',
                        // Compiles Sass to CSS
                        'sass-loader',
                      ]
					},
				    {test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,loader: 'file-loader?limit=100000'}
                ]
            }
    }]
    
};