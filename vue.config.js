module.exports = {
  assetsDir: 'assets',
  productionSourceMap: false,
  lintOnSave: false,
  configureWebpack: {
    performance: {
      maxEntrypointSize: 768000,
      maxAssetSize: 768000
    }
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0]['VERSION'] = JSON.stringify(process.env.npm_package_version)
      return args
    })
  }
}
