<template>
  <tr>
    <td>
      <div class="row items-center no-wrap q-gutter-x-sm">
        <router-link :to="{ name: 'snapshots', params: { repositoryName: repository.name } }" class="text-weight-medium">
          {{ repository.name }}
        </router-link>
        <q-badge v-if="repository.type" outline color="primary" :label="repository.type" />
        <q-badge v-if="repository.readonly" outline color="grey" label="read-only" />
      </div>
    </td>
    <td :title="JSON.stringify(repository.settings, null, 2)">
      <span v-if="repository.location" class="text-muted font-13">{{ repository.location }}</span>
      <span v-else class="text-muted">-</span>
    </td>
    <td v-if="slm">
      <div v-if="repository.policies.length" class="row q-gutter-xs">
        <q-badge
          v-for="policy in repository.policies"
          :key="policy.id"
          :outline="!policy.failing"
          :color="policy.failing ? 'negative' : 'primary'"
          :label="policy.id"
        >
          <q-tooltip>
            <div>{{ policy.schedule }}</div>
            <div v-if="policy.nextRun">next run {{ formatTimeIn(policy.nextRun) }}</div>
            <div v-if="policy.lastSuccess">last success {{ formatTimeAgo(policy.lastSuccess) }}</div>
            <div v-if="policy.failing">last failure {{ formatTimeAgo(policy.lastFailure!) }}</div>
          </q-tooltip>
        </q-badge>
      </div>
      <span v-else class="text-muted">-</span>
    </td>
    <td class="text-right text-no-wrap">
      <q-btn flat round dense icon="settings_backup_restore" title="Snapshots" @click="openSnapshots" />
      <repository-policies :repository="repository.name" :disable="!slm" @reload="emit('reload')" />
      <q-btn
        flat
        round
        dense
        icon="fact_check"
        title="Verify"
        data-testid="verify-repository"
        :disable="!canVerify"
        @click="verifyRepository"
      />
      <q-btn flat round dense icon="delete" data-testid="delete-repository" @click="deleteRepository" />
    </td>
  </tr>
</template>

<script setup lang="ts">
import RepositoryPolicies from './RepositoryPolicies.vue'
import { RepositoryRowProps, useRepositoryRow } from '../../composables/components/repositories/RepositoryRow.ts'
import { supportsRepositoryVerify } from '../../helpers/snapshotSupport.ts'
import { formatTimeAgo, formatTimeIn } from '../../helpers/time.ts'

const props = defineProps<RepositoryRowProps & { slm: boolean }>()
const emit = defineEmits<{ reload: [] }>()

const canVerify = supportsRepositoryVerify()
const { deleteRepository, verifyRepository, openSnapshots } = useRepositoryRow(props, emit)
</script>
