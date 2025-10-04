import pluginVue from 'eslint-plugin-vue'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'

export default defineConfigWithVueTs(
  vueTsConfigs.recommended, // THIS HAS TO BE THE FIRST ENTRY!!!
  pluginVue.configs['flat/essential'],
  vueI18n.configs['flat/recommended'],
  {
    rules: {
      'semi': ['error', 'never'],
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_'
        }
      ],
      '@intlify/vue-i18n/no-raw-text': 'off',
      '@intlify/vue-i18n/no-v-html': 'off',
      '@intlify/vue-i18n/no-html-messages': 'off',
      '@intlify/vue-i18n/key-format-style': ['error', 'snake_case'],
      '@intlify/vue-i18n/no-duplicate-keys-in-locale': ['error'],
      '@intlify/vue-i18n/no-dynamic-keys': 'error',
      '@intlify/vue-i18n/no-missing-keys-in-other-locales': 'error',
      '@intlify/vue-i18n/no-unknown-locale': ['error', { locales: ['en', 'fr', 'cn', 'ru', 'jp'] }],
      '@intlify/vue-i18n/no-unused-keys': ['error', {
        'src': './src',
        'extensions': ['.js', '.vue', '.ts'],
        'enableFix': true
      }],
      quotes: ['error', 'single'],
    },
    files: ['src/**/*.{js,vue,ts,json}', 'tests/**/*.ts}'],
    settings: {
      'vue-i18n': {
        localeDir: {
          pattern: './src/locales/*.json',
          localeKey: 'file'
        },
        messageSyntaxVersion: '^11.0.0'
      }
    },
    languageOptions: {
      ecmaVersion: 2020
    }
  },
  {
    files: ['src/locales/*.json'],
    rules: {
      'quotes': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
)
