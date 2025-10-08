<template>
    <div class="flex justify-between q-pa-md">
        <div class="flex items-center">
            <new-snapshot-policy @reload="emit('reload')" />
            <filter-state v-model="filter" :results-count="filterStateProps.resultsCount"
                :filtered-results-count="filterStateProps.filteredResultsCount" class="q-ml-md" />
        </div>

        <filter-input v-model="filter" :columns="['id', 'name', 'repository']" />
    </div>

    <edit-snapshot-policy :policy-name="editingPolicyName" @reload="emit('reload')" ref="editDialog" />

    <q-table flat class="table-mono table-hide-overflow" dense row-key="name" :columns="columns" :rows="filteredResults"
        :rows-per-page-options="DEFAULT_ROWS_PER_PAGE" :pagination="{ sortBy: 'name' }">
        <template #body="{ row }">
            <tr>
                <td>{{ row.id }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.schedule }}</td>
                <td>{{ row.repository }}</td>
                <td>{{ row.retention }}</td>
                <td>
                    <q-btn-group>
                        <q-btn icon="play_arrow" color="dark-grey"
                            :title="t('snapshot_policies.policies_table.execute_policy.confirm', { name: row.name })"
                            @click="executePolicy(row.id)" />
                        <q-btn icon="edit" color="dark-grey" :title="t('defaults.update')"
                            @click="editPolicy(row.id)" />
                        <q-btn icon="delete" color="dark-grey" :title="t('defaults.delete')"
                            @click="deletePolicy(row.id)" />
                    </q-btn-group>
                </td>
            </tr>
        </template>
    </q-table>
</template>

<script setup lang="ts">
import FilterInput from '../shared/FilterInput.vue'
import NewSnapshotPolicy from './NewSnapshotPolicy.vue'
import EditSnapshotPolicy from './EditSnapshotPolicy.vue'
import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
import {
    SnapshotPoliciesTableProps,
    useSnapshotPoliciesTable
} from '../../composables/components/snapshotpolicies/SnapshotPoliciesTable'
import FilterState from '../shared/FilterState.vue'
import { useTranslation } from '../../composables/i18n'

const t = useTranslation()
const props = defineProps<SnapshotPoliciesTableProps>()
const emit = defineEmits(['reload'])
const {
    filter,
    filterStateProps,
    filteredResults,
    deletePolicy,
    editPolicy,
    executePolicy,
    columns,
    editingPolicyName
} = useSnapshotPoliciesTable(props, emit)
</script>
