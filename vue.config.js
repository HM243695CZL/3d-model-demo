const path = require('path')
function resolve(dir = ''){
    return path.join(__dirname, './src', dir)
}
module.exports = {
    publicPath: './',
    outputDir: 'dist',
    assetsDir: 'static',
    productionSourceMap: false,
    lintOnSave: false,
    devServer: {
        port: 6255,
        proxy: {
            '/api':{
                target:'http://127.0.0.1:3002',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '',
                }
            }
        }
    },
    chainWebpack: config => {
        config.plugins.delete('prefetch')
        config.plugins.delete('preload')
    },
    configureWebpack: {

    }
}
