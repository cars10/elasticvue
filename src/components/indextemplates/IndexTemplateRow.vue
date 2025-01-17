<template>
  <tr class="clickable" @click="expand = !expand">
    <td>
      <q-icon :name="expand ? 'expand_less' : 'expand_more'" />
    </td>
    <td>{{ row.name }}</td>
    <td>{{ row.index_patterns || row.template || row.index_template?.index_patterns }}</td>
  </tr>

  <tr v-if="expand">
    <td colspan="100%">
      <div class="q-pa-md">
        <resizable-container>
          <code-viewer :value="JSON.stringify(cleanedRow)" />
        </resizable-container>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
  import { ref, defineAsyncComponent, computed } from 'vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import { GenericIndexTemplate } from '../../composables/components/indextemplates/IndexTemplates.ts'

  const CodeViewer = defineAsyncComponent(() => import('../shared/CodeViewer.vue'))

  const props = defineProps<{ row: GenericIndexTemplate }>()
  const expand = ref(false)
  const cleanedRow = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { indexPatterns, ...rest } = props.row
    return rest
  })
</script>