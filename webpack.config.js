const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const commonPaths = {
    root: path.resolve(__dirname),
    outputPath: path.resolve(__dirname, 'dist'),
    entryPath: path.resolve(__dirname, 'src/index.js'),
    browserEntryPath: path.resolve(__dirname, 'src/index.browser.js'),
    typingsFromPath: path.resolve(__dirname, 'src/index.d.ts'),
    typingsToPath: path.resolve(__dirname, 'dist/index.d.ts'),
    examplePath: {
        html: path.resolve(__dirname, 'example/index.html'),
        js: path.resolve(__dirname, 'example/index.js'),
    },
    chunkFilename: '[name].chunk.[chunkhash:8].js',
    cssFolder: 'css',
    jsFolder: 'js',
};

module.exports = {
    entry: commonPaths.examplePath.js,
    mode: 'development',
    output: {
        filename: '[name].js',
        path: commonPaths.outputPath,
        chunkFilename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(css|scss)$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            modules: true,
                            camelCase: true,
                            localIdentName: '[local]___[hash:base64:5]',
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            fallback: 'file-loader',
                            name: '[name][md5:hash].[ext]',
                            outputPath: 'assets/',
                            publicPath: '/assets/'
                        }
                    }
                ]
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'eslint-loader',
                exclude: /(node_modules)/,
                options: {
                    emitWarning: process.env.NODE_ENV !== 'production',
                },
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /(node_modules)/,
            },
        ],
    },
    resolve: {
        modules: ['src', 'node_modules'],
        extensions: ['*', '.js', '.jsx', '.css', '.scss'],
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            template: commonPaths.examplePath.html,
            filename: './index.html'
        }),
    ],
    devServer: {
        port: 3001,
        compress: true,
    },
    devtool: 'source-map',
};
