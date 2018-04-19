import Vue from 'vue'
import ContentOrConnect from '@/components/shared/ContentOrConnect'
import ContentOrLoading from '@/components/shared/ContentOrLoading'
import GetElasticsearchAdapter from './mixins/GetElasticsearchAdapter'
import IsConnected from './mixins/IsConnected'

// Global components
Vue.component('content-or-connect', ContentOrConnect)
Vue.component('content-or-loading', ContentOrLoading)

// Global mixins
Vue.mixin(GetElasticsearchAdapter)
Vue.mixin(IsConnected)
