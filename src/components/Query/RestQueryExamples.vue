<template>
  <div class="d-inline-block">
    <v-dialog v-model="dialog" width="900">
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on">
          Query examples
        </v-btn>
      </template>

      <v-card>
        <v-card-title>
          <h2 class="text-h5">Query examples</h2>
          <div class="ml-a">
            <v-btn icon title="Close" @click.native="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-divider/>

        <v-card-text>
          <v-row>
            <v-col>
              <div class="d-inline-block float-right">
                <v-text-field id="filter"
                              v-model="filter"
                              append-icon="mdi-magnify"
                              autofocus
                              class="v-text-field--small mb-4"
                              hide-details
                              label="Filter..."
                              name="filter"
                              @keyup.esc="filter = ''"/>
              </div>
            </v-col>
          </v-row>

          <v-data-table :items="filteredExamples"
                        :headers="headers"
                        :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}">
            <template v-slot:item="{ item, index }">
              <tr @click.exact="item.body.length > 0 ? togglePreview(index) : () => {}"
                  @click.ctrl="apply(item)"
                  class="tr--clickable"
                  title="Click to preview request body, ctrl+click to directly use an example.">
                <td>
                  <span class="font--mono">{{ item.method }}</span> {{ item.path }}
                </td>
                <td>
                  {{ item.description }}
                  <a v-if="item.doc" :href="item.doc" @click.stop target="_blank" rel="nofollow">Docs</a>
                </td>
                <td>
                  <v-btn v-if="item.body.length > 0" icon>
                    <v-icon>
                      {{ previewIndex === index ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td>
                  <v-btn small @click.stop="apply(item)">Use</v-btn>
                </td>
              </tr>
              <tr v-if="previewIndex === index" class="disable-hover-bg">
                <td colspan="42" class="my-2 py-2 px-6 lowered">
                  <print-pretty :document="item.body" :caption="`${item.method} ${item.path}`" :initial-height="300"/>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>

        <v-divider/>
        <v-card-actions class="pa-4">
          <v-btn text @click="closeDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { computed, ref } from '@vue/composition-api'
  import { DEFAULT_ITEMS_PER_PAGE, REST_QUERY_EXAMPLES } from '@/consts'
  import PrintPretty from '@/components/shared/PrintPretty'

  export default {
    name: 'rest-query-examples',
    components: {
      PrintPretty
    },
    setup (props, context) {
      const dialog = ref(false)
      const closeDialog = () => (dialog.value = false)
      const headers = [
        { text: 'Query', value: 'method' },
        { text: 'Description', value: 'description' },
        { text: 'Body', sortable: false },
        { text: 'Use', sortable: false }
      ]

      const previewIndex = ref(null)
      const togglePreview = index => {
        if (previewIndex.value === index) {
          previewIndex.value = null
        } else {
          previewIndex.value = index
        }
      }

      const filter = ref('')
      const filteredExamples = computed(() => {
        const filterValue = filter.value.trim()
        if (filterValue.length === 0) return REST_QUERY_EXAMPLES

        return REST_QUERY_EXAMPLES.filter(example => {
          return example.method.includes(filterValue) ||
            example.path.includes(filterValue) ||
            example.description.includes(filterValue)
        })
      })

      const apply = item => {
        context.emit('setRequest', item)
        closeDialog()
      }

      return {
        dialog,
        previewIndex,
        togglePreview,
        closeDialog,
        headers,
        filteredExamples,
        filter,
        DEFAULT_ITEMS_PER_PAGE,
        apply
      }
    }
  }
</script>
