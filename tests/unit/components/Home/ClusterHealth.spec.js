import '../../mocks/ElasticsearchAdapter'
import { mount } from '@vue/test-utils'
import ClusterHealth from '@/components/Home/ClusterHealth'
import flushPromises from 'flush-promises'

describe('components/Home/ClusterHealth.vue', () => {
  it('renders the clusters node information', async () => {
    let localVue = buildLocalVue()

    const wrapper = mount(ClusterHealth, {
      localVue,
      stubs: ['reload-button']
    })
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('Cluster Health')
    expect(text).toContain('cluster_name')
    expect(text).toContain('number_of_pending_tasks')
  })
})
