<template>
  <q-btn :label="$t('query.rest.history')"
         icon="history"
         :icon-right="historyOpen ? 'expand_less' : 'expand_more'"
         color="visible-bg q-mb-sm"
         @click="historyOpen = !historyOpen" />

  <q-slide-transition>
    <div v-if="historyOpen">
      <div class="row">
        <div class="col q-pr-md">
          <div class="flex justify-end q-pb-md">
            <div class="flex">
              <q-input v-model="filter" :label="t('defaults.filter.label')" dense @keyup.esc="filter = ''">
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>

          <q-table flat
                   dense
                   row-key="index"
                   :columns="columns"
                   :rows="filteredHistory"
                   :pagination="{sortBy: 'date', descending: true}"
                   :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
            <template #body="{row}">
              <tr :class="{selected: selectedRequest?.id === row.id, clickable: true}"
                  :title="row.body"
                  @click="selectedRequest = row">
                <td>
                  <div class="q-py-xs">
                    <strong>{{ row.method }}</strong> {{ row.path }}
                    <div>
                      <small class="text-muted ellipsis">{{ row.body.replace(/\s/g, '') }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ row.date.toLocaleString() }}</td>
              </tr>
            </template>
          </q-table>
        </div>

        <div class="col">
          <div v-if="selectedRequest" class="flex column full-height q-pl-md">
            <h4 class="font-mono text-h6 q-mt-none q-mb-sm">{{ selectedRequest.method }} {{ selectedRequest.path }}</h4>

            <div class="col-grow q-mb-md">
              <code-editor v-model="selectedRequest.body" />
            </div>

            <div>
              <q-btn :label="$t('query.rest_query_history.body_preview.use')"
                     color="primary-dark"
                     class="q-mr-sm"
                     @click="emit('useRequest', selectedRequest)" />
              <q-btn :label="$t('query.rest_query_history.body_preview.open_new_tab')"
                     color="visible-bg"
                     @click="emit('useRequestNewTab', selectedRequest)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-slide-transition>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import CodeEditor from '../shared/CodeEditor.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useTranslation } from '../../composables/i18n'

  const props = defineProps({
    restQueryHistory: {
      type: Array, default: () => []
    }
  })

  const t = useTranslation()
  const emit = defineEmits(['useRequest', 'useRequestNewTab'])

  const historyOpen = ref(false)
  const selectedRequest = ref(null)

  const filter = ref('')
  const filteredHistory = computed(() => {
    const search = filter.value.trim().toLowerCase()
    if (search.length === 0) return props.restQueryHistory || []

    return props.restQueryHistory.filter(element => (`${element.method} ${element.path}`.toLowerCase().includes(search)))
  })

  onMounted(async () => {
    if (!selectedRequest.value && props.restQueryHistory.length > 0) {
      selectedRequest.value = props.restQueryHistory[props.restQueryHistory.length - 1]
    }
  })

  const columns = [
    { label: t('query.rest_query_history.table.headers.query'), field: 'query', name: 'query', align: 'left' },
    {
      label: t('query.rest_query_history.table.headers.date'), field: 'date', name: 'date', align: 'left',
      sortOrder: 'da', sortable: true
    }
  ]
</script>