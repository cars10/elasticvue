import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: 'src/assets/stylesheets/quasar/quasar-variables.scss'
    }),
  ],
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  }
})
