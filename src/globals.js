import Vue from 'vue'
import ContentOrConnect from '@/components/shared/ContentOrConnect'
import ContentOrLoading from '@/components/shared/ContentOrLoading'
import getElasticsearchAdapter from './mixins/getElasticsearchAdapter'

// Global components
Vue.component('content-or-connect', ContentOrConnect)
Vue.component('content-or-loading', ContentOrLoading)

// Global mixins
Vue.mixin(getElasticsearchAdapter)
