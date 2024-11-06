<template>
  <q-btn :label="t('query.rest_query_examples.heading')" icon="info" color="dark-grey" class="q-mb-sm"
         @click="dialog = true" />

  <q-dialog v-model="dialog" transition-duration="100">
    <q-card style="min-width: 900px; max-width: 1600px;">
      <q-card-section class="flex justify-between">
        <div class="flex">
          <h2 class="text-h6 q-my-none">
            {{ t('query.rest_query_examples.heading') }}
          </h2>
        </div>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <div class="flex justify-end q-pa-md">
        <filter-input v-model="filter" />
      </div>

      <q-table flat
               dense
               row-key="description"
               :columns="columns"
               :rows="filteredExamples"
               :rows-per-page-options="[0]"
               hide-pagination>
        <template #body="props">
          <tr>
            <td class="font--mono">
              <span :class="`http-${props.row.method}`" class="text-bold">{{ props.row.method }}</span>
              {{ props.row.path }}
            </td>
            <td>
              <div class="flex justify-between">
                <div>
                  {{ props.row.description }}
                </div>
                <q-btn icon="info" flat dense size="sm" :href="props.row.doc" round target="_blank" />
              </div>
            </td>
            <td class="small-wrap">
              <q-btn-group v-if="props.row.body.length > 0">
                <q-btn label="Preview" color="dark-grey" @click="props.expand = !props.expand" />
                <q-btn :label="t('query.rest_query_examples.table.row.use')" color="dark-grey"
                       @click="useRequest(props.row)" />
              </q-btn-group>
              <div v-else class="flex justify-end">
                <q-btn :label="t('query.rest_query_examples.table.row.use')" color="dark-grey"
                       @click="useRequest(props.row)" />
              </div>
            </td>
          </tr>
          <tr v-show="props.expand" v-if="props.row.body.length > 0">
            <td colspan="42">
              <div class="q-my-md">
                <div class="q-mb-md">
                  <span :class="`http-${props.row.method}`" class="text-bold">{{ props.row.method }}</span>
                  {{ props.row.path }}
                </div>

                <resizable-container :min-height="200">
                  <code-viewer :value="props.row.body" />
                </resizable-container>
              </div>
            </td>
          </tr>
        </template>
      </q-table>

      <q-card-section>
        <q-btn v-close-popup flat :label="t('defaults.close')" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, defineAsyncComponent, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import FilterInput from '../shared/FilterInput.vue'
  import { REST_QUERY_EXAMPLES } from '../../consts.ts'
  import { genColumns } from '../../helpers/tableColumns.ts'
  import ResizableContainer from '../shared/ResizableContainer.vue'

  const CodeViewer = defineAsyncComponent(() => import('../shared/CodeViewer.vue'))

  const t = useTranslation()
  const dialog = ref(false)
  const filter = ref('')
  const emit = defineEmits(['useRequest'])

  type Row = {
    method: string,
    path: string,
    body: string
  }
  const useRequest = (row: Row) => {
    emit('useRequest', { method: row.method, path: row.path, body: row.body })
    dialog.value = false
  }

  const filteredExamples = computed(() => {
    const filterValue = filter.value.trim()
    if (filterValue.length === 0) return REST_QUERY_EXAMPLES

    return REST_QUERY_EXAMPLES.filter(example => {
      return example.method.includes(filterValue) ||
        example.path.includes(filterValue) ||
        example.description.includes(filterValue)
    })
  })

  watch(dialog, value => {
    if (!value) filter.value = ''
  })

  const columns = genColumns([
    { label: t('query.rest_query_examples.table.headers.query') },
    { label: t('query.rest_query_examples.table.headers.description') },
    { label: '' }
  ])
</script>