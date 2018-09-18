const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

module.exports = {
  assetsDir: 'assets',
  productionSourceMap: false,
  lintOnSave: false,
  configureWebpack: {
    performance: {
      maxEntrypointSize: 768000,
      maxAssetSize: 768000
    },
    plugins: [
      new FaviconsWebpackPlugin({
        logo: './public/images/logo/logo_128_blue.png',
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
