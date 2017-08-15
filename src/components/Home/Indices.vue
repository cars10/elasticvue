<template>
  <div>
    <table>
      <thead>
      <tr>
        <th>Name</th>
        <th>Health</th>
        <th>Status</th>
        <th>UUID</th>
        <th>Pri</th>
        <th>Rep</th>
        <th>Docs</th>
        <th>Store size</th>
        <th>Pri Store size</th>
      </tr>
      </thead>
      <tbody>
        <index v-for="index in this.$store.state.indices" :key="index.index" :index="index"></index>
      </tbody>
    </table>
  </div>
</template>

<script>
  import Index from '@/components/Home/Index'

  export default {
    components: {
      Index
    }
  }
</script>
