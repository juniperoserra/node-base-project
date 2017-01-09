const path = require('path');
var webpack = require('webpack');

var isProd = (process.env.NODE_ENV === 'production');
// Switch here if you dist build goes to a different place
var buildDir = isProd ? 'lib/' : 'lib/';

var config = {
    target: 'node',
    node: {
        __dirname: false,
        __filename: false
    },
    entry: ['babel-polyfill', './src/index'],

    output: {
        filename: 'index.js',
        path: buildDir
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: "babel-loader",
            include: [
                path.resolve(__dirname, "src"),
                //path.resolve(__dirname, "index.js")
            ]
        }, {
            test: /\.json?$/,
            loader: 'json'
        }]
    },
    plugins: []
};

// Do not try to use unmap to source in production distributions
if (!isProd) {
    config.devtool = 'sourcemap';
    config.plugins.push(
        new webpack.BannerPlugin('require(\'source-map-support\').install();', { raw: true, entryOnly: false })
    );
}

module.exports = config;
