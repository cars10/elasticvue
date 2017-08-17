<template>
  <div>
    <md-table v-if="hits">
      <md-table-header>
        <md-table-row>
          <md-table-head md-sort-by="_index">_index</md-table-head>
          <md-table-head md-sort-by="_id">_id</md-table-head>
          <md-table-head md-sort-by="_type">_type</md-table-head>
          <md-table-head v-for="key in Object.keys(hits[0]._source)">{{key}}</md-table-head>
        </md-table-row>
      </md-table-header>

      <md-table-body>
        <md-table-row v-for="hit in hits" :key="hit._id">
          <md-table-cell>{{hit._index}}</md-table-cell>
          <md-table-cell>{{hit._id}}</md-table-cell>
          <md-table-cell>{{hit._type}}</md-table-cell>
          <md-table-cell v-for="key in Object.keys(hit._source)">{{hit._source[key]}}</md-table-cell>
        </md-table-row>
      </md-table-body>
    </md-table>
  </div>
</template>

<script>
  export default {
    props: ['hits']
  }
</script>
