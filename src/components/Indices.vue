<template>
  <div>
    <v-card>
      <v-card-title>
        <h2>Indices</h2>
      </v-card-title>
      <v-divider></v-divider>
      <indices-table></indices-table>
    </v-card>
  </div>
</template>

<script>
  import IndicesTable from '@/components/Indices/IndicesTable'

  export default {
    components: {
      IndicesTable
    }
  }
</script>
