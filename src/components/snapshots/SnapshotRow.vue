<template>
  <tr>
    <td>
      <div class="text-weight-medium">{{ snapshot.name }}</div>
      <div class="text-muted font-13">
        <a v-if="snapshot.indices.length" href="#" @click.prevent>
          <q-menu>
            <div class="q-pa-sm">
              <div v-for="index in snapshot.indices" :key="index" class="font-13">{{ index }}</div>
            </div>
          </q-menu>
          <span>{{ t('snapshots.snapshot.indices', { count: snapshot.indices.length }) }}</span>
        </a>
        <span v-else>{{ t('snapshots.snapshot.indices', { count: 0 }) }}</span>
        <template v-if="snapshot.includeGlobalState">, global state</template>
        <template v-if="snapshot.version">, v{{ snapshot.version }}</template>
      </div>
    </td>
    <td>
      <q-badge
        :outline="snapshot.state === 'SUCCESS'"
        :color="snapshotStateColor(snapshot.state)"
        :text-color="snapshot.state === 'PARTIAL' || snapshot.state === 'IN_PROGRESS' ? 'dark' : undefined"
        :label="snapshot.state.toLowerCase().replace('_', ' ')"
      >
        <q-tooltip v-if="snapshot.failures.length" class="font-mono">
          <div v-for="failure in snapshot.failures.slice(0, 10)" :key="failure">{{ failure }}</div>
          <div v-if="snapshot.failures.length > 10">+{{ snapshot.failures.length - 10 }} more</div>
        </q-tooltip>
      </q-badge>
    </td>
    <td>
      <template v-if="snapshot.startTime">
        <div>{{ new Date(snapshot.startTime).toLocaleDateString() }}</div>
        <div class="text-muted font-13">{{ new Date(snapshot.startTime).toLocaleTimeString() }}</div>
      </template>
      <template v-else>-</template>
    </td>
    <td>
      <template v-if="snapshot.endTime">
        <div>{{ new Date(snapshot.endTime).toLocaleDateString() }}</div>
        <div class="text-muted font-13">{{ new Date(snapshot.endTime).toLocaleTimeString() }}</div>
      </template>
      <template v-else>-</template>
    </td>
    <td class="text-right">{{ snapshot.durationMs === null ? '-' : formatTime(snapshot.durationMs) }}</td>
    <td class="text-right">
      <template v-if="snapshot.shardsTotal !== null">
        {{ snapshot.shardsSuccessful ?? '-' }}/{{ snapshot.shardsTotal }}
        <div v-if="snapshot.shardsFailed" class="health--red font-13">{{ snapshot.shardsFailed }} failed</div>
      </template>
      <template v-else>-</template>
    </td>
    <td class="text-right text-no-wrap">
      <restore-snapshot :snapshot="snapshot.name" :repository="repository" :disable="!snapshot.restorable" />
      <q-btn flat round dense icon="delete" data-testid="delete-snapshot" @click="deleteSnapshot" />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { SnapshotRowProps, useSnapshotRow } from '../../composables/components/snapshots/SnapshotRow'
import RestoreSnapshot from './RestoreSnapshot.vue'
import { useTranslation } from '../../composables/i18n'
import { snapshotStateColor } from '../../helpers/snapshots.ts'
import { formatTime } from '../../helpers/time.ts'

const props = defineProps<SnapshotRowProps>()
const emit = defineEmits(['reload'])
const t = useTranslation()

const { deleteSnapshot } = useSnapshotRow(props, emit)
</script>
