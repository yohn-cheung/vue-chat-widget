const path = require('path');
const webpack = require('webpack');
var copyWebpackPlugin = require('copy-webpack-plugin');
const bundleOutputDir = './dist';

module.exports = (env) => {
    const isDevBuild = !(env && env.prod); 

    return [{
        entry: './index.js',
        output: {
            filename: 'widget.js',
            path: path.resolve(bundleOutputDir),
        },
        devServer: {
            contentBase: bundleOutputDir
        },
        plugins: isDevBuild
            // ? [new webpack.SourceMapDevToolPlugin(), new copyWebpackPlugin([{ from: 'dev/' }])]
            ? [new webpack.SourceMapDevToolPlugin(), new copyWebpackPlugin({ patterns: [{ from: 'dev/'}]})]
            : [],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }, {
                    test: /.vue$/, 
                    loader: 'vue-loader'
                },
                {
                    test: /\.css$/, 
                    use: [
                        'vue-style-loader',
                        'css-loader'
                    ]
                }
            ]
        }
    }]
    
};