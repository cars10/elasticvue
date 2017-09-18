<template>
  <div>
    <md-table-card>
      <md-table @sort="onSort">
        <md-table-header>
          <md-table-row>
            <md-table-head md-sort-by="index">Name</md-table-head>
            <md-table-head md-sort-by="health">Health</md-table-head>
            <md-table-head md-sort-by="status">Status</md-table-head>
            <md-table-head md-sort-by="uuid">UUID</md-table-head>
            <md-table-head md-sort-by="pri">Pri</md-table-head>
            <md-table-head md-sort-by="rep">Rep</md-table-head>
            <md-table-head>Docs</md-table-head>
            <md-table-head>Store size</md-table-head>
            <md-table-head>Pri Store size</md-table-head>
          </md-table-row>
        </md-table-header>

        <md-table-body>
          <md-table-row v-for="index in this.$store.state.connection.indices" :key="index.index">
            <md-table-cell>{{index.index}}</md-table-cell>
            <md-table-cell>{{index.health}}</md-table-cell>
            <md-table-cell>{{index.status}}</md-table-cell>
            <md-table-cell>{{index.uuid}}</md-table-cell>
            <md-table-cell>{{index.pri}}</md-table-cell>
            <md-table-cell>{{index.rep}}</md-table-cell>
            <md-table-cell>{{index['docs.count']}}</md-table-cell>
            <md-table-cell>{{index['store.size']}}</md-table-cell>
            <md-table-cell>{{index['pri.store.size']}}</md-table-cell>
          </md-table-row>
        </md-table-body>
      </md-table>
    </md-table-card>
  </div>
</template>

<script>
  export default {
    methods: {
      onSort (sort) {
        this.$store.commit('sortIndices', {prop: sort.name, order: sort.type})
      }
    }
  }
</script>
