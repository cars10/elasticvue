<template>
  <q-btn id="new_index"
         icon="save"
         color="visible-bg q-mb-sm q-mx-md"
         label="Saved queries" @click="dialog = true" />

  <q-dialog v-model="dialog">
    <q-card style="width: 500px">
      <q-card-section class="flex justify-between">
        IB IMS
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref } from 'vue'

  const dialog = ref(false)
</script>