<template>
  <q-item clickable @click="dialog = true">
    <q-item-section side>
      <q-icon name="alternate_email" size="xs" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ $t('indices.index_aliases.text') }}</q-item-label>
    </q-item-section>
  </q-item>

  <q-dialog v-model="dialog">
    <q-card style="width: 600px; max-width: 80vw;">
      <q-card-section class="flex justify-between">
        <div class="flex">
          <h2 class="text-h6 q-my-none flex">
            {{ $t('indices.index_aliases.heading') }}
          </h2>
        </div>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <p>{{ $t('indices.index_aliases.index', { index }) }}</p>

        <q-form @submit="addAlias">
          <div class="flex">
            <q-input id="new_index_alias_name"
                     v-model="newAlias"
                     class="col-grow"
                     :label="$t('indices.index_aliases.form.new_alias.label')"
                     lazy-rules
                     autocomplete="off"
                     autofocus
                     dense
                     required />

            <q-btn id="add_index_alias"
                   :disable="requestState.loading || newAlias.length === 0"
                   color="positive"
                   :loading="requestState.loading"
                   :label="$t('indices.index_aliases.form.add_alias')"
                   type="submit"
                   class="q-ml-md" />
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-table flat
               dense
               row-key="index"
               :columns="columns"
               :rows="aliases"
               :pagination="{sortBy: 'alias'}"
               :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
        <template #body="{row}">
          <tr>
            <td>{{ row.alias }}</td>
            <td class="text-right">
              <q-btn :label="$t('defaults.delete')" color="visible-bg" @click="deleteAlias(row.alias)" />
            </td>
          </tr>
        </template>
      </q-table>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import { useSnackbar } from '../../composables/Snackbar'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { askConfirm } from '../../helpers/dialogs'

  const t = useTranslation()

  const props = defineProps({
    index: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['reload'])

  const { showSnackbar } = useSnackbar()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  const dialog = ref(false)
  const newAlias = ref('')
  const aliases = ref([])

  watch(dialog, value => {
    if (value) {
      loadAliases()
    } else {
      emit('reload')
    }
  })

  const loadAliases = () => {
    callElasticsearch('indexGetAlias', { index: props.index })
        .then(body => {
          aliases.value = Object.keys(body[props.index].aliases).map(alias => ({ alias }))
        })
        .catch(() => (aliases.value = []))
  }

  const addAlias = () => {
    callElasticsearch('indexAddAlias', { index: props.index, alias: newAlias.value })
        .then(() => {
          loadAliases()
          newAlias.value = ''
        })
        .catch(() => showSnackbar(requestState.value))
  }

  const deleteAlias = alias => {
    askConfirm(t('indices.index_aliases.delete_alias.confirm', { alias, index: props.index }))
        .then(confirmed => {
          if (confirmed) {
            callElasticsearch('indexDeleteAlias', { index: props.index, alias })
                .then(loadAliases)
                .catch(() => showSnackbar(requestState.value))
          }
        })
  }

  const columns = [
    {
      label: t('indices.index_aliases.table.headers.alias'),
      name: 'alias',
      align: 'left',
      sortable: true,
      field: 'alias'
    },
    { label: '', sortable: false }
  ]
</script>