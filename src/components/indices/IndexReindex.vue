<template>
  <q-item clickable @click="dialog = true">
    <q-item-section side>
      <q-icon name="sync_alt" size="xs" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ t('indices.index_reindex.text') }}</q-item-label>
    </q-item-section>
  </q-item>

  <q-dialog v-model="dialog" transition-duration="100">
    <q-card style="width: 600px; max-width: 80vw;">
      <q-card-section class="flex justify-between">
        <div class="flex">
          <h2 class="text-h6 q-my-none flex">
            {{ t('indices.index_reindex.heading') }}
          </h2>
        </div>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-form @submit="reindex">
        <q-card-section>
          <p>{{ t('indices.index_reindex.index', { index }) }}</p>

          <q-input v-model="dest"
                   :label="t('indices.index_reindex.form.source.label')"
                   autocomplete="off"
                   autofocus
                   outlined
                   required />
        </q-card-section>

        <q-card-section>
          <q-btn :disable="requestState.loading || dest.length === 0"
                 color="positive"
                 :loading="requestState.loading"
                 :label="t('indices.index_reindex.form.reindex')"
                 type="submit" />
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/i18n'
  import { IndexReindexProps, useIndexReindex } from '../../composables/components/indices/IndexReindex'

  const t = useTranslation()

  const props = defineProps<IndexReindexProps>()
  const emit = defineEmits(['reload'])

  const { dialog, requestState, reindex, dest } = useIndexReindex(props, emit)
</script>