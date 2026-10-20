<template>
  <div class="flex justify-between q-pa-md">
    <div class="flex items-center">
      <new-role @reload="emit('reload')" />
      <filter-state
        v-model="rolesStore.filter"
        :results-count="filterStateProps.resultsCount"
        :filtered-results-count="filterStateProps.filteredResultsCount"
        class="q-ml-md"
      />
    </div>

    <filter-input v-model="rolesStore.filter" :columns="filterColumns" />
  </div>

  <q-table
    class="table-mono table-hide-overflow"
    flat
    dense
    row-key="name"
    :columns="columns"
    :rows="filteredResults"
    data-testid="roles-table"
    :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
    v-model:pagination="rolesStore.pagination"
  >
    <template #body="{ row }: { row: ClusterRole }">
      <role-row
        :role="row"
        :usage="usage[row.name]"
        :usage-known="usageKnown"
        @reload="emit('reload')"
        @edit="openEditDialog"
        @show-users="showUsers"
      />
    </template>
  </q-table>

  <edit-role ref="editRole" @reload="emit('reload')" />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { useConnectionStore } from '../../store/connection.ts'
import { useUsersStore } from '../../store/users.ts'
import FilterInput from '../shared/FilterInput.vue'
import FilterState from '../shared/FilterState.vue'
import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
import type { ClusterRole } from '../../types/security.ts'
import { RolesTableProps, useRolesTable } from '../../composables/components/roles/RolesTable.ts'
import { useRolesStore } from '../../store/roles.ts'
import RoleRow from './RoleRow.vue'
import NewRole from './NewRole.vue'
import EditRole from './EditRole.vue'

const rolesStore = useRolesStore()
const props = defineProps<RolesTableProps>()
const emit = defineEmits(['reload'])
const { columns, filteredResults, filterStateProps, showDescription } = useRolesTable(props)
const filterColumns = showDescription ? ['name', 'description', 'cluster'] : ['name', 'cluster']

const router = useRouter()
const usersStore = useUsersStore()
const connectionStore = useConnectionStore()

const showUsers = (role: string) => {
  usersStore.filter = `roles:${role}`
  router.push({ name: 'users', params: { clusterIndex: connectionStore.activeClusterIndex } })
}

const editRole = useTemplateRef<InstanceType<typeof EditRole>>('editRole')
const openEditDialog = (role: ClusterRole) => {
  editRole.value?.openDialog(role)
}
</script>
