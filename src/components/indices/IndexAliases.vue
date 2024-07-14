<template>
  <q-item clickable @click="dialog = true">
    <q-item-section side>
      <q-icon name="alternate_email" size="xs" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ t('indices.index_aliases.text') }}</q-item-label>
    </q-item-section>
  </q-item>

  <q-dialog v-model="dialog" transition-duration="100">
    <q-card style="width: 600px; max-width: 80vw;">
      <q-card-section class="flex justify-between">
        <div class="flex">
          <h2 class="text-h6 q-my-none flex">
            {{ t('indices.index_aliases.heading') }}
          </h2>
        </div>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <p>{{ t('indices.index_aliases.index', { index }) }}</p>

        <q-form @submit="addAlias">
          <div class="flex">
            <q-input id="new_index_alias_name"
                     v-model="newAlias"
                     class="col-grow"
                     :label="t('indices.index_aliases.form.new_alias.label')"
                     lazy-rules
                     autocomplete="off"
                     autofocus
                     outlined
                     dense
                     required />

            <q-btn id="add_index_alias"
                   :disable="requestState.loading || newAlias.length === 0"
                   color="positive"
                   :loading="requestState.loading"
                   :label="t('indices.index_aliases.form.add_alias')"
                   type="submit"
                   class="q-ml-md" />
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-table v-if="aliases.length > 0"
               class="table-mono table-hide-overflow"
               flat
               dense
               row-key="alias"
               :columns="columns"
               :rows="aliases"
               :pagination="{sortBy: 'alias'}"
               :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
        <template #body="{row}">
          <tr>
            <td>{{ row.alias }}</td>
            <td class="text-right">
              <q-btn :label="t('defaults.delete')" color="dark-grey" @click="deleteAlias(row.alias)" />
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
  import { IndexAliasProps, useIndexAliases } from '../../composables/components/indices/IndexAliases'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()
  const props = defineProps<IndexAliasProps>()
  const emit = defineEmits(['reload'])

  const { dialog, requestState, newAlias, aliases, addAlias, deleteAlias, columns } = useIndexAliases(props, emit)
</script>