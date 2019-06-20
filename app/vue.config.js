'use strict';

module.exports = {
    configureWebpack: {
        module: {
            rules: [
                {
                    // test: /\.mp3$/,
                    // loader: 'url-loader',
                    // options: {
                    //     limit: 10000,
                    //     name: 'audio/[name].[ext]'
                    // }
                },
            ]
        },
    }
};