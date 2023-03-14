<template>
  <div class="row">
    <div class="col q-pr-md">
      <div class="flex justify-between q-pb-md">
        <h4 class="text-h5 q-mb-none q-mt-sm">{{ heading }}</h4>
        <q-input v-model="filter" :label="t('defaults.filter.label')" dense @keyup.esc="filter = ''">
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <q-table flat
               dense
               row-key="index"
               :columns="columns"
               :rows="filteredData"
               :pagination="paginationOptions"
               :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
        <template #body="{row}">
          <tr :class="{selected: selectedRow?.id === row.id, clickable: true}"
              @click="selectedRow = row"
              @dblclick="emit('useRequest', selectedRow)">
            <slot :row="row" />
          </tr>
        </template>
      </q-table>
    </div>

    <div class="col">
      <div v-if="selectedRow" class="flex column full-height q-pl-md">
        <h4 class="font-mono text-h6 q-mt-none q-mb-sm">
          <strong :class="`http-${selectedRow.method}`">{{ selectedRow.method }}</strong>
          {{ selectedRow.path }}
        </h4>

        <div class="col-grow q-mb-md">
          <code-editor v-model="selectedRow.body" />
        </div>

        <div>
          <q-btn :label="t('query.rest_query_history.body_preview.use')"
                 color="primary-dark"
                 class="q-mr-sm"
                 @click="emit('useRequest', selectedRow)" />
          <q-btn :label="t('query.rest_query_history.body_preview.open_new_tab')"
                 color="visible-bg"
                 @click="emit('useRequestNewTab', selectedRow)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import CodeEditor from '../shared/CodeEditor.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useTranslation } from '../../composables/i18n'
  const t = useTranslation()

  const props = defineProps({
    data: {
      type: Array, default: () => []
    },
    columns: {
      type: Array, default: () => []
    },
    heading: {
      type: String,
      default: ''
    },
    paginationOptions: {
      type: Object,
      default: () => {
      }
    }
  })

  const emit = defineEmits(['useRequest', 'useRequestNewTab'])

  const selectedRow = ref(null)

  const filter = ref('')
  const filteredData = computed(() => {
    const search = filter.value.trim().toLowerCase()
    if (search.length === 0) return props.data || []

    return props.data.filter(element => (`${element.method} ${element.path}`.toLowerCase().includes(search)))
  })
</script>