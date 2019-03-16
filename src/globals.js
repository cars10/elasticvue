import Vue from 'vue'
import ReloadButton from '@/components/shared/ReloadButton'
import ElasticsearchAdapterHelper from './mixins/ElasticsearchAdapterHelper'

// Global components
Vue.component('reload-button', ReloadButton)

// Global mixins
Vue.mixin(ElasticsearchAdapterHelper)
