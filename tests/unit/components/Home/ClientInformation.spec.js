import '../../mocks/ElasticsearchAdapter'
import { mount } from '@vue/test-utils'
import ClientInformation from '@/components/Home/ClientInformation'
import flushPromises from 'flush-promises'

describe('components/Home/ClientInformation.vue', () => {
  it('renders the clusters node information', async () => {
    let localVue = buildLocalVue()

    const wrapper = mount(ClientInformation, {
      localVue,
      stubs: ['reload-button']
    })
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('Node Information')
    expect(text).toContain('cluster_name')
    expect(text).toContain('81a1e9eda8e6183f5237786246f6dced26a10eaf')
  })
})
