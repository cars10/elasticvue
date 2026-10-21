<template>
  <q-btn
    flat
    round
    dense
    icon="policy"
    :title="t('repositories.repository_policies.text')"
    :disable="disable"
    data-testid="repository-policies"
    @click="dialog = true"
  />

  <q-dialog v-model="dialog" transition-duration="100">
    <q-card style="width: 800px; max-width: 90vw">
      <q-card-section class="flex justify-between">
        <div class="flex">
          <h2 class="text-h6 q-my-none flex">
            {{ t('repositories.repository_policies.heading') }}
          </h2>
        </div>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="flex items-center q-mb-md">
          <new-repository-snapshot-policy :repository="repository" @reload="loadPolicies" />
          <span class="q-ml-md">{{ t('repositories.repository_policies.repository', { repository }) }}</span>
        </div>

        <edit-repository-snapshot-policy
          ref="editDialog"
          :repository="repository"
          :policy-id="selectedPolicyId"
          @reload="loadPolicies"
        />
      </q-card-section>

      <q-separator />

      <q-table
        v-if="policies.length > 0"
        flat
        dense
        row-key="id"
        :columns="columns"
        :rows="policies"
        :pagination="{ sortBy: 'name' }"
        :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
      >
        <template #body="{ row }">
          <tr>
            <td>{{ row.id }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.schedule }}</td>
            <td>
              {{ retentionFormat(row.retention) || '-' }}
            </td>
            <td>
              <div v-if="row.lastSuccess" :title="new Date(row.lastSuccess).toLocaleString()">
                {{ formatTimeAgo(row.lastSuccess) }}
              </div>
              <div v-if="row.failing" class="health--red font-13">
                failed {{ formatTimeAgo(row.lastFailure!) }}
                <q-tooltip v-if="row.lastFailureDetails" class="font-mono">{{ row.lastFailureDetails }}</q-tooltip>
              </div>
              <span v-if="!row.lastSuccess && !row.failing" class="text-muted">-</span>
            </td>
            <td :title="row.nextRun ? new Date(row.nextRun).toLocaleString() : undefined">
              {{ row.nextRun ? formatTimeIn(row.nextRun) : '-' }}
            </td>
            <td class="text-right text-no-wrap">
              <q-btn flat round dense icon="play_arrow" @click="executePolicy(row.id)" />
              <q-btn flat round dense icon="edit" @click="editPolicy(row.id)" />
              <q-btn flat round dense icon="delete" @click="deletePolicy(row.id)" />
            </td>
          </tr>
        </template>
      </q-table>

      <q-card-section>
        <q-btn id="close" v-close-popup flat :label="t('defaults.close')" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
import { RepositoryPoliciesProps, useRepositoryPolicies } from '../../composables/components/repositories/RepositoryPolicies'
import { useTranslation } from '../../composables/i18n'
import NewRepositorySnapshotPolicy from './NewRepositorySnapshotPolicy.vue'
import EditRepositorySnapshotPolicy from './EditRepositorySnapshotPolicy.vue'
import { type SnapshotPolicyRetention } from '../../types/snapshotPolicies'
import { formatTimeAgo, formatTimeIn } from '../../helpers/time.ts'

const t = useTranslation()
const props = defineProps<RepositoryPoliciesProps & { disable?: boolean }>()
const emit = defineEmits(['reload'])
const retentionFormat = (retention: SnapshotPolicyRetention | undefined) => {
  if (!retention) return ''
  return [
    retention?.expire_after,
    retention?.max_count ? `max ${retention?.max_count}` : null,
    retention?.min_count ? `min ${retention?.min_count}` : null
  ]
    .filter(Boolean)
    .join(', ')
}

const { dialog, policies, loadPolicies, executePolicy, editPolicy, deletePolicy, columns, selectedPolicyId } =
  useRepositoryPolicies(props, emit)
</script>
