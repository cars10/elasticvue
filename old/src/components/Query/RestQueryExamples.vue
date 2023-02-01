<template>
  <div class="d-inline-block">
    <v-dialog v-model="dialog" width="900">
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" id="query_examples">
          {{ $t('query.rest_query_examples.heading') }}
        </v-btn>
      </template>

      <v-card>
        <v-card-title>
          <h2 class="text-h5">{{ $t('query.rest_query_examples.heading') }}</h2>
          <div class="ml-a">
            <v-btn :title="$t('defaults.close')" icon @click.native="closeDialog">
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
                              :label="$t('defaults.filter.label')"
                              append-icon="mdi-magnify"
                              autofocus
                              class="v-text-field--small mb-4"
                              hide-details
                              name="filter"
                              @keyup.esc="filter = ''"/>
              </div>
            </v-col>
          </v-row>

          <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                        :headers="headers"
                        :items="filteredExamples">
            <template v-slot:item="{ item, index }">
              <tr :title="$t('query.rest_query_examples.table.row.title')"
                  class="tr--clickable"
                  @click.exact="item.body.length > 0 ? togglePreview(index) : () => {}"
                  @click.ctrl="apply(item)">
                <td>
                  <span class="font--mono">{{ item.method }}</span> {{ item.path }}
                </td>
                <td>
                  {{ item.description }}
                  <a v-if="item.doc" :href="item.doc" rel="nofollow" target="_blank" @click.stop>
                    {{ $t('query.rest_query_examples.table.row.docs') }}
                  </a>
                </td>
                <td>
                  <v-btn v-if="item.body.length > 0" icon>
                    <v-icon>
                      {{ previewIndex === index ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                    </v-icon>
                  </v-btn>
                </td>
                <td>
                  <v-btn small @click.stop="apply(item)" :id="`use_query_example_${index}`">
                    {{ $t('query.rest_query_examples.table.row.use') }}
                  </v-btn>
                </td>
              </tr>
              <tr v-if="previewIndex === index" class="disable-hover-bg">
                <td class="my-2 py-2 px-6 lowered" colspan="42">
                  <print-pretty :caption="`${item.method} ${item.path}`" :document="item.body" :initial-height="300"/>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>

        <v-divider/>
        <v-card-actions class="pa-4">
          <v-btn text @click="closeDialog">{{ $t('defaults.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { computed, ref } from 'vue'
  import { DEFAULT_ITEMS_PER_PAGE, REST_QUERY_EXAMPLES } from '@/consts'
  import PrintPretty from '@/components/shared/PrintPretty'
  import i18n from '@/i18n'

  export default {
    name: 'rest-query-examples',
    components: {
      PrintPretty
    },
    setup (props, context) {
      const dialog = ref(false)
      const closeDialog = () => (dialog.value = false)
      const headers = [
        { text: i18n.t('query.rest_query_examples.table.headers.query'), value: 'method' },
        { text: i18n.t('query.rest_query_examples.table.headers.description'), value: 'description' },
        { text: i18n.t('query.rest_query_examples.table.headers.body'), sortable: false },
        { text: i18n.t('query.rest_query_examples.table.headers.use'), sortable: false }
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
