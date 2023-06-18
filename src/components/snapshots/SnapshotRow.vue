<template>
  <tr>
    <td>{{ snapshot.id }}</td>
    <td>{{ snapshot.status }}</td>
    <td>{{ snapshot.start_time }} ({{ snapshot.start_epoch }})</td>
    <td>{{ snapshot.end_time }} ({{ snapshot.end_epoch }})</td>
    <td>{{ snapshot.duration }}</td>
    <td>
      <q-btn :label="t('snapshots.snapshot.indices', {count: snapshot.indices})"
             dense
             no-caps
             color="dark-grey">
        <q-menu @before-show="load">
          <div class="q-pa-sm">
            <div v-for="index in indexNames" :key="index">
              <span class="font-13">{{ index }}</span>
            </div>
          </div>
        </q-menu>
      </q-btn>
    </td>
    <td>{{ snapshot.successful_shards }}</td>
    <td>{{ snapshot.failed_shards }}</td>
    <td>{{ snapshot.total_shards }}</td>
    <td>
      <q-btn-group>
        <restore-snapshot :snapshot="snapshot.id" :repository="repository" />
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

  const { load, indexNames, deleteSnapshot } = useSnapshotRow(props, emit)
</script>