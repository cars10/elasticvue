<template>
  <q-tr>
    <q-td>{{ snapshot.id }}</q-td>
    <q-td>{{ snapshot.status }}</q-td>
    <q-td>{{ snapshot.start_time }} ({{ snapshot.start_epoch }})</q-td>
    <q-td>{{ snapshot.end_time }} ({{ snapshot.end_epoch }})</q-td>
    <q-td>{{ snapshot.duration }}</q-td>
    <q-td>
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
    </q-td>
    <q-td>{{ snapshot.successful_shards }}</q-td>
    <q-td>{{ snapshot.failed_shards }}</q-td>
    <q-td>{{ snapshot.total_shards }}</q-td>
    <q-td>
      <q-btn-group>
        <restore-snapshot :snapshot="snapshot.id" :repository="repository" />
        <q-btn icon="delete" color="dark-grey" @click="deleteSnapshot" />
      </q-btn-group>
    </q-td>
  </q-tr>
</template>

<script setup lang="ts">
  import { useSnapshotRow } from '../../composables/components/snapshots/SnapshotRow'
  import RestoreSnapshot from './RestoreSnapshot.vue'
  import { useTranslation } from '../../composables/i18n'

  const props = defineProps<{ snapshot: Snapshot, repository: string }>()
  const emit = defineEmits(['reload'])
  const t = useTranslation()

  const { load, indexNames, deleteSnapshot } = useSnapshotRow({
    emit,
    repository: props.repository,
    snapshot: props.snapshot.id
  })
</script>