<template>
  <div>
    <h1>Browse</h1>
    <md-input-container>
      <label for="indices">Indices</label>
      <md-select multiple name="indices" id="indices" v-model="indices">
        <md-option :value="index.index" :key="index.index" v-for="index in this.$store.state.indices">
          {{ index.index }}
        </md-option>
      </md-select>
    </md-input-container>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        indices: []
      }
    }
  }
</script>
