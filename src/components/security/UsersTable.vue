<template>
  <q-card>
    <q-card-section>
      <q-table
        v-model:pagination="usersStore.pagination"
        :rows="users"
        :columns="columns"
        :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
        row-key="username"
        dense
      >
        <template #body-cell-enabled="props">
          <q-td :props="props">
            <q-toggle
              v-model="props.row.enabled"
              checked-icon="check"
              unchecked-icon="clear"
              color="green"
              @update:model-value="toggleUserEnabled(props.row)"
              :disable="props.row.metadata?._reserved"
            />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              color="negative"
              icon="delete"
              size="sm"
              @click="deleteUser(props.row.username)"
            />
          </q-td>
        </template>

        <template #bottom="scope">
          <table-bottom v-model="usersStore.pagination.rowsPerPage"
                        :scope="scope"
                        :total="users.length"
                        :rows-per-page="rowsPerPage"
                        @rows-per-page-accepted="acceptRowsPerPage" />
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
  import { useUsersTable } from '../../composables/components/security/UsersTable'
  import TableBottom from '../shared/TableBottom.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts.ts'
  
  const emit = defineEmits<{ 
    reload: []
  }>()

  const { 
    users, 
    columns, 
    deleteUser, 
    toggleUserEnabled,
    rowsPerPage,
    acceptRowsPerPage,
    usersStore } = useUsersTable(emit)
</script>
