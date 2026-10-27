<template>
  <q-btn :label="t('cluster_selection.new_cluster.add_cluster')" color="primary-dark" @click="dialog = true" />
  <setup-instance v-model="dialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SetupInstance from '../setup/SetupInstance.vue'
import { useTranslation } from '../../composables/i18n.ts'

const dialog = ref(false)
const t = useTranslation()
</script>
