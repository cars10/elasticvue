import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { Dark } from 'quasar';
import { createTestingPinia } from '@pinia/testing'
import { vueI18n } from '../src/plugins/vue-i18n'
import { config } from '@vue/test-utils';
import { fn } from '@vitest/spy';

// Inject global plugins
config.global.plugins.unshift(
    createTestingPinia({
        createSpy: fn,
    }),
    vueI18n()
);

// Prepare instance
installQuasarPlugin({
    plugins: {
        Dark
    }
});