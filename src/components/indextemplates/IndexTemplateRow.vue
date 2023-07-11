<template>
  <tr class="clickable" @click="expand = !expand">
    <td>
      <q-icon :name="expand ? 'expand_less' : 'expand_more'" />
    </td>
    <td>{{ row.name }}</td>
    <td>{{ row.index_patterns }}</td>
    <td>{{ row.order }}</td>
    <td>{{ row.version }}</td>
  </tr>

  <tr v-if="expand">
    <td colspan="100%">
      <div class="q-pa-md">
        <resizable-container>
          <code-viewer :value="JSON.stringify(row)" />
        </resizable-container>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
  import { ref, defineAsyncComponent } from 'vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import { EsIndexTemplate } from '../../composables/components/indextemplates/IndexTemplatesTable.ts'

  const CodeViewer = defineAsyncComponent(() => import('../shared/CodeViewer.vue'))

  defineProps<{ row: EsIndexTemplate }>()
  const expand = ref(false)
</script>