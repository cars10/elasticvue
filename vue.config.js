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
      files: [
        'tests/**/*.spec.js',
        'src/components/**/*',
        'src/helpers/**/*',
        'src/mixins/**/*',
        'src/services/**/*',
        'src/views/**/*'
      ],
      karmaConfig: {
        reporters: ['mocha', 'coverage'],
        coverageReporter: {
          dir: './tests/coverage',
          reporters: [
            {type: 'lcov', subdir: '.'},
            {type: 'text-summary'}
          ]
        },
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
