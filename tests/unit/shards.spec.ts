import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VueWrapper, mount } from '@vue/test-utils'
import { useConnectionStore } from '../../src/store/connection'
import { newElasticsearchCluster } from '../../src/helpers/newCluster'
import IndexShards from '../../src/components/shards/IndexShards.vue'
import ElasticsearchAdapter from '../../src/services/ElasticsearchAdapter'

let wrapper: VueWrapper<any>

beforeEach(() => {
    const store = useConnectionStore();
    const cluster = newElasticsearchCluster();
    store.clusters.push(cluster);
    store.activeClusterIndex = 0;

    vi.spyOn(ElasticsearchAdapter.prototype, 'request').mockResolvedValueOnce({});

    wrapper = mount(IndexShards);
});

describe('IndexShards', () => {
    it('renders properly', () => {
        expect(wrapper.vm.t).toBeTruthy();
    });
});