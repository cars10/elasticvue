<template>
  <div>
    <v-card-text>
      <v-flex right d-inline-flex>
        <v-text-field append-icon="search"
                      label="Filter"
                      name="Filter"
                      id="filter"
                      v-model="filter"></v-text-field>
      </v-flex>
    </v-card-text>
    <v-data-table :rows-per-page-items="[10, 25, 100]"
                  :headers="headers"
                  :items="indices"
                  :custom-sort="sortIndices"
                  :search="filter"
                  :loading="loading">
      <template slot="items" slot-scope="props">
        <tr @click="showDocuments(props.item.index)" class="tr--clickable">
          <td>{{props.item.index}}</td>
          <td>{{props.item.health}}</td>
          <td>{{props.item.status}}</td>
          <td>{{props.item.uuid}}</td>
          <td class="text-xs-right">{{props.item.pri}}</td>
          <td class="text-xs-right">{{props.item.rep}}</td>
          <td class="text-xs-right">{{props.item['docs.count']}}</td>
          <td class="text-xs-right">{{props.item['store.size']}}</td>
          <td class="text-xs-right">{{props.item['pri.store.size']}}</td>
          <td>
            <btn-group small>
              <v-btn flat @click.native.stop="showDocuments(props.item.index)" title="Browse documents">
                <v-icon>view_list</v-icon>
              </v-btn>
              <v-btn flat @click.native.stop="openIndex(props.item.index)" title="Show">
                <v-icon>info_outline</v-icon>
              </v-btn>
              <v-btn flat @click.native.stop="deleteIndex(props.item.index)" title="Delete">
                <v-icon>delete</v-icon>
              </v-btn>
            </btn-group>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import BtnGroup from '@/components/shared/BtnGroup'

  export default {
    name: 'IndicesTable',
    data () {
      return {
        headers: [
          {text: 'Name', value: 'index'},
          {text: 'Health', value: 'health'},
          {text: 'Status', value: 'status'},
          {text: 'UUID', value: 'uuid'},
          {text: 'Pri', value: 'pri', align: 'right'},
          {text: 'Rep', value: 'rep', align: 'right'},
          {text: 'Docs', value: 'docs.count', align: 'right'},
          {text: 'Store size', value: 'store.size', align: 'right'},
          {text: 'Pri Store size', value: 'pri.store.size', align: 'right'},
          {text: 'Actions', value: 'actions', sortable: false}
        ]
      }
    },
    props: {
      indices: {
        default: () => []
      },
      loading: {
        default: false
      }
    },
    computed: {
      filter: {
        get () {
          return this.$store.state.indices.filter
        },
        set (filter) {
          this.$store.commit('setFilter', filter)
        }
      }
    },
    methods: {
      sortIndices (items, index, isDescending) {
        const NUMBER_KIND_VALUES = ['pri', 'rep', 'docs.count', 'store.size', 'pri.store.size']
        return items.sort((a, b) => {
          let valA = a[index]
          let valB = b[index]

          // Parse the values to float because string sorting does not work right here.
          if (NUMBER_KIND_VALUES.includes(index)) {
            valA = parseFloat(a[index])
            valB = parseFloat(b[index])
          }

          if (valA < valB) {
            return isDescending ? 1 : -1
          } else if (valA > valB) {
            return isDescending ? -1 : 1
          } else {
            return 0
          }
        })
      },
      showDocuments (index) {
        this.$store.commit('setBrowseIndices', [index]) // to pre-select right index on "Browse" page
        this.$router.push({name: 'Browse', params: {executeSearch: true}})
      },
      openIndex (index) {
        this.$router.push({name: 'Index', params: {index: index}})
      },
      deleteIndex (index) {
        if (confirm('Are you sure? This will remove ALL data in your index!')) {
          this.getElasticsearchAdapter()
            .then(adapter => adapter.indicesDelete({index}))
            .then(body => {
              this.$emit('deleteIndex', index)
              this.showSuccessSnackbar({text: `The index '${index}' was successfully deleted.`, additionalText: body})
            })
            .catch(error => this.$store.commit('setErrorState', error))
        }
      }
    },
    components: {
      BtnGroup
    }
  }
</script>
