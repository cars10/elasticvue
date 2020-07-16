const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
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
      new VuetifyLoaderPlugin(),
      new FaviconsWebpackPlugin({
        logo: './public/images/logo/favicon_128.png',
        prefix: 'assets/favicons/[hash]/',
        favicons: {
          icons: {
            android: false,
            appleIcon: false,
            appleStartup: false,
            coast: false,
            favicons: true,
            firefox: false,
            opengraph: false,
            twitter: false,
            yandex: false,
            windows: false
          }
        }
      })
    ]
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0]['VERSION'] = JSON.stringify(process.env.npm_package_version)
      return args
    })
  }
}
