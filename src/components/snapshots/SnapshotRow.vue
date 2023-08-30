<template>
  <tr>
    <td>{{ snapshot.snapshot }}</td>
    <td>{{ snapshot.state }}</td>
    <td>
      <span v-if="snapshot.start_time">{{ new Date(snapshot.start_time).toLocaleString() }}</span>
      <span v-if="snapshot.start_time_in_millis"> ({{ Math.floor(snapshot.start_time_in_millis / 1000) }})</span>
    </td>
    <td>
      <span v-if="snapshot.end_time">{{ new Date(snapshot.end_time).toLocaleString() }}</span>
      <span v-if="snapshot.end_time_in_millis"> ({{ Math.floor(snapshot.end_time_in_millis / 1000) }})</span>
    </td>
    <td>
      <span v-if="typeof snapshot.duration_in_millis != 'undefined'">
        {{ Math.floor(snapshot.duration_in_millis / 1000) }}s
      </span>
    </td>
    <td>
      <q-btn :label="t('snapshots.snapshot.indices', {count: snapshot.indices.length})"
             dense
             no-caps
             color="dark-grey">
        <q-menu>
          <div class="q-pa-sm">
            <div v-for="index in snapshot.indices" :key="index">
              <span class="font-13">{{ index }}</span>
            </div>
          </div>
        </q-menu>
      </q-btn>
    </td>
    <td>{{ snapshot.shards.successful }}</td>
    <td>{{ snapshot.shards.failed }}</td>
    <td>{{ snapshot.shards.total }}</td>
    <td>
      <q-btn-group>
        <restore-snapshot :snapshot="snapshot.snapshot" :repository="repository" />
        <q-btn icon="delete" color="dark-grey" @click="deleteSnapshot" />
      </q-btn-group>
    </td>
  </tr>
</template>

<script setup lang="ts">
  import { SnapshotRowProps, useSnapshotRow } from '../../composables/components/snapshots/SnapshotRow'
  import RestoreSnapshot from './RestoreSnapshot.vue'
  import { useTranslation } from '../../composables/i18n'

  const props = defineProps<SnapshotRowProps>()
  const emit = defineEmits(['reload'])
  const t = useTranslation()

  const { deleteSnapshot } = useSnapshotRow(props, emit)
</script>