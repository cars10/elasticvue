import Vue from 'vue'
import DataLoader from '@/components/shared/DataLoader'
import ReloadButton from '@/components/shared/ReloadButton'
import ElasticsearchAdapter from './mixins/ElasticsearchAdapter'
import ShowSnackbar from './mixins/ShowSnackbar'

// Global components
Vue.component('data-loader', DataLoader)
Vue.component('reload-button', ReloadButton)

// Global mixins
Vue.mixin(ElasticsearchAdapter)
Vue.mixin(ShowSnackbar)
