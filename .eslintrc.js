module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript',
  ],
  rules: {
    'vue/max-attributes-per-line': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'quotes': ['error', 'single']
  }
}
