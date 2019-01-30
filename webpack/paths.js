const path = require('path');

module.exports = {
    root: path.resolve(__dirname, '../'),
    outputPath: path.resolve(__dirname, '../', 'dist'),
    entryPath: path.resolve(__dirname, '../', 'src/index.js'),
    examplePath: {
        html: path.resolve(__dirname, '../', 'example/index.html'),
        js: path.resolve(__dirname, '../', 'example/index.js'),
    },
    chunkFilename: '[name].chunk.[chunkhash:8].js',
    cssFolder: 'css',
    jsFolder: 'js',
};
