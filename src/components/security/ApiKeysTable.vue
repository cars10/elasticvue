<template>
  <q-card>    
    <q-card-section>
      <q-table
        v-model:pagination="apikeysStore.pagination"
        :rows="apiKeys"
        :columns="columns"
        :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
        row-key="id"
        dense
      >
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              color="negative"
              icon="delete"
              size="sm"
              @click="deleteApiKey(props.row.id)"
            />
          </q-td>
        </template>

        <template #bottom="scope">
          <table-bottom v-model="apikeysStore.pagination.rowsPerPage"
                        :scope="scope"
                        :total="apiKeys.length"
                        :rows-per-page="rowsPerPage"
                        @rows-per-page-accepted="acceptRowsPerPage" />
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
  import { useApiKeysTable } from '../../composables/components/security/ApiKeysTable'
  import TableBottom from '../shared/TableBottom.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts.ts'

  const emit = defineEmits<{ 
    reload: []
  }>()

  const { 
    apiKeys,
    columns,
    deleteApiKey,
    rowsPerPage,
    acceptRowsPerPage,
    apikeysStore  } = useApiKeysTable(emit)
</script>
