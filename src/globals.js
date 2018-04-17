import Vue from 'vue'
import ContentOrConnect from '@/components/shared/ContentOrConnect'
import ContentOrLoading from '@/components/shared/ContentOrLoading'
import GetElasticsearchAdapter from './mixins/GetElasticsearchAdapter'
import IsConnected from './mixins/IsConnected'

// Global components
Vue.component('content-or-connect', ContentOrConnect)
Vue.component('content-or-loading', ContentOrLoading)

const renderObject = function (createElement, object) {
  let array = []
  let header = createElement('div', '{')
  Object.keys(object).map(key => {
    if (typeof object[key] === 'object' && object[key] !== null) {
      array.push(createElement('div', [
        createElement('span', `${key}: `),
        createElement('div', renderObject(createElement, object[key]))
      ]))
    } else {
      array.push(createElement('div', [
        createElement('span', `${key}: `),
        createElement('span', object[key])
      ]))
    }
  })
  let footer = createElement('div', '}')
  return [header, createElement('div', {class: 'pl-4'}, array), footer]
}

Vue.component('object-pretty-print', {
  props: ['object'],
  render: function (createElement) {
    return createElement('div', renderObject(createElement, Object.assign({}, this.object)))
  }
})

// Global mixins
Vue.mixin(GetElasticsearchAdapter)
Vue.mixin(IsConnected)
