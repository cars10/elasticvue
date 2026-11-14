<template>
  <div class="flex items-center">
    <q-btn
      v-if="node && reroutingShard.index === index && reroutingShard.node !== node"
      class="q-mx-xs q-my-xs"
      color="primary-dark"
      icon="check"
      no-caps
      @click="emit('reroute', reroutingShard, node)"
    />

    <index-shard
      v-for="(shard, i) in shards"
      :key="i"
      :shard="shard"
      :action="(s: EsShard) => emit('select', s)"
      :re-routable="!!node"
      :outlined="
        !(node && reroutingShard.index === index && reroutingShard.node === node && reroutingShard.shard === shard.shard)
      "
    />
  </div>
</template>

<script setup lang="ts">
import IndexShard from './IndexShard.vue'
import type { EsShard } from '../../helpers/shards.ts'

defineProps<{ index: string; node?: string; shards?: EsShard[]; reroutingShard: EsShard }>()
const emit = defineEmits<{ select: [shard: EsShard]; reroute: [shard: EsShard, node: string] }>()
</script>
