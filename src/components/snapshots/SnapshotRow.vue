<template>
  <q-tr>
    <q-td>{{ snapshot.id }}</q-td>
    <q-td>{{ snapshot.status }}</q-td>
    <q-td>{{ snapshot.start_time }} ({{ snapshot.start_epoch }})</q-td>
    <q-td>{{ snapshot.end_time }} ({{ snapshot.end_epoch }})</q-td>
    <q-td>{{ snapshot.duration }}</q-td>
    <q-td>
      {{ snapshot.indices }}
      <q-btn :label="t('snapshots.snapshot.indices.show')" dense flat color="dark-grey q-ml-md">
        <q-menu @before-show="load">
          <q-list dense>
            <q-item v-for="index in indexNames" :key="index">
              <q-item-section class="font-13">{{ index }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-td>
    <q-td>{{ snapshot.successful_shards }}</q-td>
    <q-td>{{ snapshot.failed_shards }}</q-td>
    <q-td>{{ snapshot.total_shards }}</q-td>
  </q-tr>
</template>

<script setup lang="ts">
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import { useSnackbar } from '../../composables/Snackbar'
  import { ref } from 'vue'
  import { useTranslation } from '../../composables/i18n'

  const props = defineProps<{ snapshot: object, repository: string }>()
  const emit = defineEmits(['reload'])
  const t = useTranslation()

  let indexNamesLoaded = false
  const indexNames = ref([])

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { showSnackbar } = useSnackbar()

  const load = () => {
    if (indexNamesLoaded) return
    callElasticsearch('getSnapshot', { repository: props.repository, snapshot: props.snapshot.id }).then(body => {
      indexNamesLoaded = true
      indexNames.value = body.snapshots[0].indices.sort()
    }).catch(() => showSnackbar(requestState.value))
  }
</script>