<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col>
          <div class="float-right">
            <v-text-field id="filter"
                          v-model="filter"
                          :label="$t('defaults.filter.label')"
                          append-icon="mdi-magnify"
                          autofocus
                          class="mt-0 pt-0 mr-2 v-text-field--small"
                          hide-details
                          name="filter"
                          @keyup.esc="filter = ''"/>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                  :headers="HEADERS"
                  :items="items"
                  :loading="loading"
                  :options.sync="options"
                  class="table--condensed">
      <template v-slot:item="props">
        <tr>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.index_template.index_patterns }}</td>
          <td>{{ props.item.index_template.priority }}</td>
          <td>{{ props.item.index_template.version }}</td>
          <td>{{ props.item.index_template.allow_auto_create }}</td>
          <td>{{ JSON.stringify(props.item.index_template.template) }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import { vuexAccessors } from '@/helpers/store'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { computed } from 'vue'
  import { filterItems } from '@/helpers/filters'
  import i18n from '@/i18n'

  export default {
    name: 'index-templates-table',
    props: {
      indexTemplates: {
        default: () => ([]),
        type: Array
      },
      loading: {
        default: false,
        type: Boolean
      }
    },
    setup (props) {
      const { filter, options } = vuexAccessors('indexTemplates', ['filter', 'options'])

      const enrichedIndexTemplates = computed(() => {
        return props.indexTemplates.map(i => (Object.assign({}, i, { indexPatterns: i.index_template.index_patterns.join(' ') })))
      })
      const items = computed(() => {
        return filterItems(enrichedIndexTemplates.value, filter.value, ['name', 'indexPatterns'])
      })

      const HEADERS = [
        { text: i18n.t('index_templates.index_templates_table.table.headers.name'), value: 'name' },
        {
          text: i18n.t('index_templates.index_templates_table.table.headers.index_patterns'),
          value: 'index_template.index_patterns'
        },
        {
          text: i18n.t('index_templates.index_templates_table.table.headers.priority'),
          value: 'index_template.priority'
        },
        {
          text: i18n.t('index_templates.index_templates_table.table.headers.version'),
          value: 'index_template.version'
        },
        {
          text: i18n.t('index_templates.index_templates_table.table.headers.allow_auto_create'),
          value: 'index_template.allow_auto_create'
        },
        {
          text: i18n.t('index_templates.index_templates_table.table.headers.template'),
          value: 'template',
          sortable: false
        }
      ]

      return {
        DEFAULT_ITEMS_PER_PAGE,
        filter,
        options,
        items,
        HEADERS
      }
    }
  }
</script>
