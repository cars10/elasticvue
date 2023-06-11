import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

function removeDataTestid (node) {
  if (node.type === 1 /* NodeTypes.ELEMENT */) {
    node.props = node.props.filter(prop => prop.type === 6 ? prop.name !== 'data-testid' : true)
  }
}

const prod = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [
    vue({
      template: {
        transformAssetUrls,
        compilerOptions: {
          nodeTransforms: prod ? [removeDataTestid] : [],
        }
      }
    }),
    quasar(),
  ],
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  }
})
