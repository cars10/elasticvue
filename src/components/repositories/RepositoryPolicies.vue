<template>
  <q-btn :label="t('repositories.repository_policies.text')" icon="policy" color="dark-grey" @click="dialog = true" />

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
              {{ retentionFormat(row.retention) }}
            </td>
            <td class="text-right">
              <q-btn-group>
                <q-btn icon="play_arrow" color="dark-grey" @click="executePolicy(row.id)" />
                <q-btn icon="edit" color="dark-grey" @click="editPolicy(row.id)" />
                <q-btn icon="delete" color="dark-grey" @click="deletePolicy(row.id)" />
              </q-btn-group>
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
import { type SnapshotPolicyRetention } from '../../types/snapshotPolicies'

const t = useTranslation()
const props = defineProps<RepositoryPoliciesProps>()
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

const { dialog, policies, loadPolicies, executePolicy, editPolicy, deletePolicy, columns } = useRepositoryPolicies(props, emit)
</script>
