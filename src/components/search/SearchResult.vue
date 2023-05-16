<template>
  <q-tr class="clickable" @click="openDoc">
    <q-td v-for="{field: column} in columns" :key="column">
      <template v-if="column === '_type'">{{ doc[column] || '_doc' }}</template>
      <template v-else-if="doc.hasOwnProperty(column)">{{ renderValue(doc[column]) }}</template>
    </q-td>
    <q-td>
      <q-btn :label="$t('search.result.show')" color="dark-grey" />
    </q-td>
  </q-tr>
</template>

<script setup lang="ts">
  const props = defineProps<{ columns: string[], doc: any }>()

  const openDoc = () => {
    console.log(props.doc)
  }

  const renderValue = value => {
    if (typeof value === 'object') {
      return JSON.stringify(value)
    } else {
      return value
    }
  }
</script>
