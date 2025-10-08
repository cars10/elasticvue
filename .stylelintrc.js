module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-prettier/recommended'
  ],
  plugins: ['stylelint-prettier'],
  rules: {
    // Disable rules that conflict with Prettier
    'prettier/prettier': true,
    'selector-class-pattern': null,
    'import-notation': null,
    'at-rule-no-unknown': null,
  },
  ignoreFiles: [
    'node_modules/**/*',
    'dist/**/*',
    'coverage/**/*',
    '*.min.css'
  ]
}
