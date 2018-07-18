process.env.CHROME_BIN = require('puppeteer').executablePath()
module.exports = {
  assetsDir: 'assets',
  productionSourceMap: false,
  lintOnSave: false,
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0]['VERSION'] = JSON.stringify(process.env.npm_package_version)
      return args
    })
  },
  pluginOptions: {
    karma: {
      karmaConfig: {
        browsers: ['ChromeHeadlessWithoutSecurity', 'FirefoxHeadless'],
        customLaunchers: {
          ChromeHeadlessWithoutSecurity: {
            base: 'ChromeHeadless',
            flags: ['--no-sandbox']
          },
          FirefoxHeadless: {
            base: 'Firefox',
            flags: ['-headless']
          }
        }
      }
    }
  }
}
