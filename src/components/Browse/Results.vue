<template>
  <div>
    <md-table v-if="hits && hits.length > 0" class="white-space--nowrap md-table--condensed md-table--striped">
      <md-table-header>
        <md-table-row>
          <md-table-head md-sort-by="_index">_index</md-table-head>
          <md-table-head md-sort-by="_id">_id</md-table-head>
          <md-table-head md-sort-by="_type">_type</md-table-head>
          <md-table-head v-for="key in Object.keys(hits[0]._source)" :key="key">{{key}}</md-table-head>
        </md-table-row>
      </md-table-header>

      <md-table-body>
        <md-table-row v-for="hit in hits" :key="hit._type + '_' + hit._id" @click.native="onClick(hit)">
          <md-table-cell>{{hit._index}}</md-table-cell>
          <md-table-cell>{{hit._id}}</md-table-cell>
          <md-table-cell>{{hit._type}}</md-table-cell>
          <md-table-cell v-for="key in Object.keys(hit._source)" :key="hit._index + '_' + key">{{hit._source[key]}}
          </md-table-cell>
        </md-table-row>
      </md-table-body>
    </md-table>
  </div>
</template>

<script>
  export default {
    props: ['hits'],
    methods: {
      onClick (el) {
        console.log(el)
        this.$router.push({name: 'Document', params: {index: el._index, type: el._type, id: el._id}})
      }
    }
  }
</script>
