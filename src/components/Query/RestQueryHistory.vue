<template>
  <div>
    <v-btn class="pl-1" @click="historyCollapsed = !historyCollapsed" title="Show history">
      <v-icon>{{ historyCollapsed ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      History
    </v-btn>

    <v-expand-transition>
      <div v-if="historyCollapsed" class="my-2 pa-2 lowered">
        <v-icon v-if="loading">mdi-cog</v-icon>

        <v-row>
          <v-col>
            <v-data-table :items="localHistory" dense :headers="HEADERS">
              <template v-slot:item="{ item }">
                <tr class="tr--clickable" @click="setHist(item)" title="Click to preview request body">
                  <td>{{ item.method }} {{ item.url }}</td>
                  <td>{{ item.date.toISOString() }}</td>
                  <td>
                    <v-btn icon title="Apply">
                      <v-icon>mdi-check</v-icon>
                    </v-btn>
                  </td>
                  <td>
                    <v-btn icon title="Delete">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-col>
          <v-col class="d-flex" style="flex-flow:column">
            <div style="flex:2">
              <code-viewer v-model="selectedHistory.body"/>
            </div>
            <div>
              <v-btn class="mt-4" color="primary">Apply</v-btn>
            </div>
          </v-col>
        </v-row>

      </div>
    </v-expand-transition>
  </div>
</template>

<script>
  import { ref } from '@vue/composition-api'
  import { useDb } from '@/services/History'
  import CodeViewer from '@/components/shared/CodeViewer'

  export default {
    name: 'rest-query-history',
    components: {
      CodeViewer
    },
    setup () {
      const localHistory = ref([])
      const selectedHistory = ref({})
      const loading = ref(true)

      const { loadDb, dbInsert, dbGetAll } = useDb('QueryHistory', 'rest')
      loadDb().then(db => {
        dbGetAll(db).then(a => {
          // dbInsert(db, { method: 'PUT', url: 'some_index', body: '{"test": 1, "something": 2}', date: new Date() })
          loading.value = false
          localHistory.value = a.reverse()
        })
      })

      const HEADERS = [
        { text: 'Query', sortable: false },
        { text: 'Date', value: 'date' },
        { text: '', sortable: false },
        { text: '', sortable: false }
      ]
      const historyCollapsed = ref(true)
      const setHist = hist => {
        selectedHistory.value = hist
      }

      return {
        historyCollapsed,
        loading,
        localHistory,
        selectedHistory,
        setHist,
        HEADERS
      }
    }
  }
</script>
