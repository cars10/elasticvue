<template>
  <q-btn label="Details" dense color="dark-grey" icon="help">
    <q-menu>
      <q-list>
        <template v-if="indices.yellow.length > 0">
          <q-item-label header>Yellow indices</q-item-label>
          <q-item v-for="yellow in indices.yellow" :key="yellow" dense>
            <q-item-label>{{ yellow }}</q-item-label>
          </q-item>
        </template>

        <q-separator v-if="indices.yellow.length > 0 && indices.red.length > 0" />

        <template v-if="indices.red.length > 0">
          <q-item-label header>Red indices</q-item-label>
          <q-item v-for="red in indices.red" :key="red" dense>
            <q-item-label>{{ red }}</q-item-label>
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'

  const props = defineProps<{ health: string }>()
  const { callElasticsearch } = useElasticsearchAdapter()

  const indices = ref({
    yellow: [],
    red: []
  })

  const unhealthyIndices = health => (callElasticsearch('catIndices', { h: 'index', health }))
  const loadUnhealthyIndices = async () => {
    try {
      const yellow = await unhealthyIndices('yellow')
      indices.value.yellow = yellow.map(i => i.index)

      if (props.health === 'red') {
        const red = await unhealthyIndices('red')
        indices.value.red = red.map(i => i.index)
      }
    } catch (e) {
      console.log(e)
    }
  }

  watch(() => props.health, loadUnhealthyIndices)
  onMounted(loadUnhealthyIndices)
</script>