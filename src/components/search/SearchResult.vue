<template>
  <tr class="clickable" @click="openDoc">
    <td>
      <slot name="checkbox" />
    </td>
    <td v-for="{field: column} in columns" :key="column">
      <template v-if="column === '_type'">{{ doc[column] }}</template>
      <template v-else>{{ renderValue(doc, column) }}</template>
    </td>
    <td>
      <q-btn-group>
        <q-btn :title="t('search.search_result.show.title')" color="dark-grey" icon="info" />

        <q-btn-dropdown ref="menu" v-model="dropdown" icon="settings" color="dark-grey" @click.stop>
          <q-list padding dense>
            <edit-document :_id="doc._id" :_index="doc._index" :_type="doc._type" />

            <q-separator />

            <row-menu-action method="delete"
                             :method-params="docInfo()"
                             :text="t('search.search_result.delete.text', 1)"
                             :growl="t('search.search_result.delete.growl', 1)"
                             :confirm="t('search.search_result.delete.confirm', 1)"
                             icon="delete"
                             @done="emit('reload')" />
          </q-list>
        </q-btn-dropdown>
      </q-btn-group>
    </td>
  </tr>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/i18n.ts'
  import { ref } from 'vue'
  import RowMenuAction from '../indices/RowMenuAction.vue'
  import EditDocument from './EditDocument.vue'
  import { useModal } from '../../composables/Modal.ts'
  import { useSearchStore } from '../../store/search.ts'

  const props = defineProps<{ columns: any[], doc: any }>()
  const emit = defineEmits(['reload'])
  const t = useTranslation()

  const dropdown = ref(false)
  const searchStore = useSearchStore()

  const { openModalWith } = useModal()
  const openDoc = () => (openModalWith('get', docInfo()))
  const docInfo = () => ({ index: props.doc._index, type: props.doc._type, id: props.doc._id })

  const renderValue = (doc: any, column: string) => {
    if (!doc.hasOwnProperty(column)) return
    const value = doc[column]

    if (searchStore.localizeTimestamp && column === '@timestamp') {
      const d = Date.parse(value)
      return new Date(d).toLocaleString()
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    } else {
      return value
    }
  }
</script>
