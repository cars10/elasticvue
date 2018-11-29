import Vue from 'vue'
import DataLoader from '@/components/shared/DataLoader'
import ReloadButton from '@/components/shared/ReloadButton'
import ElasticsearchAdapterHelper from './mixins/ElasticsearchAdapterHelper'
import OpenModal from './mixins/OpenModal'

// Global components
Vue.component('data-loader', DataLoader)
Vue.component('reload-button', ReloadButton)

// Global mixins
Vue.mixin(ElasticsearchAdapterHelper)
Vue.mixin(OpenModal)
