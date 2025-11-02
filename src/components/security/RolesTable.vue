<template>
  <q-card>
    <q-card-section>
      <q-table
        v-model:pagination="rolesStore.pagination"
        :rows="roles"
        :columns="columns"
        :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
        row-key="name"
        dense
      >
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              color="negative"
              icon="delete"
              size="sm"
              @click="deleteRole(props.row.name)"
            />
          </q-td>
        </template>
        <template #body-cell-cluster="props">
          <q-td :props="props">
            <div v-html="props.value" />
          </q-td>
        </template>
        <template #body-cell-indices="props">
          <q-td :props="props">
            <div v-html="props.value" />
          </q-td>
        </template>

        <template #bottom="scope">
          <table-bottom v-model="rolesStore.pagination.rowsPerPage"
                        :scope="scope"
                        :total="roles.length"
                        :rows-per-page="rowsPerPage"
                        @rows-per-page-accepted="acceptRowsPerPage" />
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
  import { useRolesTable } from '../../composables/components/security/RolesTable'
  import TableBottom from '../shared/TableBottom.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts.ts'

  const emit = defineEmits<{ 
    reload: []
  }>()

  const { 
    roles,
    columns,
    deleteRole,
    rowsPerPage,
    acceptRowsPerPage,
    rolesStore } = useRolesTable(emit)
</script>

