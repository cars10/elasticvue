<template>
  <div>
    <v-card>
      <v-data-table :rows-per-page-items="[10, 25, 100]"
                    v-bind:headers="headers"
                    v-bind:items="this.$store.state.connection.indices">
        <template slot="items" slot-scope="props">
          <td>{{props.item.index}}</td>
          <td class="text-xs-right">{{props.item.health}}</td>
          <td class="text-xs-right">{{props.item.status}}</td>
          <td class="text-xs-right">{{props.item.uuid}}</td>
          <td class="text-xs-right">{{props.item.pri}}</td>
          <td class="text-xs-right">{{props.item.rep}}</td>
          <td class="text-xs-right">{{props.item['docs.count']}}</td>
          <td class="text-xs-right">{{props.item['store.size']}}</td>
          <td class="text-xs-right">{{props.item['pri.store.size']}}</td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        headers: [
          {text: 'Name', value: 'index', align: 'left'},
          {text: 'Health', value: 'health'},
          {text: 'Status', value: 'status'},
          {text: 'UUID', value: 'uuid'},
          {text: 'Pri', value: 'pri'},
          {text: 'Rep', value: 'rep'},
          {text: 'Docs', value: 'docs.count'},
          {text: 'Store size', value: 'store.size'},
          {text: 'Pri Store size', value: 'pri.store.size'}
        ]
      }
    },
    methods: {
      onSort (sort) {
        this.$store.commit('sortIndices', {prop: sort.name, order: sort.type})
      }
    }
  }
</script>
