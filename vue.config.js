const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  publicPath: process.env.VUE_APP_PUBLIC_PATH || '/',
  assetsDir: 'assets',
  productionSourceMap: false,
  lintOnSave: false,
  devServer: {
    disableHostCheck: true
  },
  configureWebpack: {
    performance: {
      maxEntrypointSize: 768000,
      maxAssetSize: 768000
    },
    plugins: [
      new VuetifyLoaderPlugin()
    ]
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0].VERSION = JSON.stringify(process.env.npm_package_version)
      return args
    })
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.qiwihui.elasticvue',
        mac: {
          icon: 'public/images/icons/icon.icns'
        }
      }
    }
  }
}
