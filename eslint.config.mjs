import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})
import vueI18n from '@intlify/eslint-plugin-vue-i18n'

export default [
  ...compat.extends('plugin:vue/vue3-recommended', '@vue/eslint-config-typescript'),
  ...vueI18n.configs['flat/recommended'],
  {
    rules: {
      'semi': ['error', 'never'],
      'vue/script-indent': ['error', 2, { 'baseIndent': 1 }],
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      '@intlify/vue-i18n/no-raw-text': 'off',
      '@intlify/vue-i18n/no-v-html': 'off',
      '@intlify/vue-i18n/no-html-messages': 'off',
      '@intlify/vue-i18n/key-format-style': ['error', 'snake_case'],
      '@intlify/vue-i18n/no-duplicate-keys-in-locale': ['error'],
      '@intlify/vue-i18n/no-dynamic-keys': 'error',
      '@intlify/vue-i18n/no-missing-keys-in-other-locales': 'error',
      '@intlify/vue-i18n/no-unknown-locale': ['error', { locales: ['en', 'fr', 'cn'] }],
      '@intlify/vue-i18n/no-unused-keys': ['error', {
        'src': './src',
        'extensions': ['.js', '.vue', '.ts'],
        'enableFix': true
      }],
      quotes: ['error', 'single'],
    },
    files: ['src/**/*.{js,vue,ts,json}'],
    settings: {
      'vue-i18n': {
        localeDir: {
          pattern: './src/locales/*.json',
          localeKey: 'file'
        },
        messageSyntaxVersion: '^9.0.0'
      }
    },
    languageOptions: {
      ecmaVersion: 2020
    }
  },
]