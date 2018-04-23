import Vue from 'vue'
import ContentOrLoading from '@/components/shared/ContentOrLoading'
import GetElasticsearchAdapter from './mixins/GetElasticsearchAdapter'
import IsConnected from './mixins/IsConnected'

// Global components
Vue.component('content-or-loading', ContentOrLoading)

// Global mixins
Vue.mixin(GetElasticsearchAdapter)
Vue.mixin(IsConnected)
