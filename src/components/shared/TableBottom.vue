<template>
  <div class="flex col-grow justify-end">
    <div class="q-table__control">
      <span class="q-table__bottom-item">Records per page</span>

      <q-select v-model="perPage"
                class="q-table__select inline q-table__bottom-item"
                :options="options"
                borderless
                dense
                options-dense menu-anchor="bottom left" menu-self="bottom left">
        <template #option="{ itemProps, opt}">
          <q-item v-bind="itemProps" :clickable="opt.enabled">
            <q-item-section>
              <q-item-label :class="{disabled: !opt.enabled}">{{ opt.label }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="opt.needsConfirm" side>
              <q-toggle :model-value="opt.enabled" @click.stop="() => (confirmAll(opt))" />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <div class="q-table__control">
      <div v-if="scope.pagination.rowsPerPage !== 0" class="q-table__bottom-item">
        {{ firstRowIndex }}-{{ lastRowIndex }} of {{ scope.pagination.rowsNumber || total }}
      </div>
      <div v-else>
        {{ firstRowIndex }}-{{ total }} of {{ scope.pagination.rowsNumber || total }}
      </div>
    </div>

    <div class="q-table__control">
      <q-btn v-if="scope.pagesNumber > 2"
             icon="first_page"
             color="grey-8"
             size="sm"
             round
             dense
             flat
             :disable="scope.isFirstPage"
             @click="scope.firstPage" />

      <q-btn icon="chevron_left"
             color="grey-8"
             size="sm"
             round
             dense
             flat
             :disable="scope.isFirstPage"
             @click="scope.prevPage" />

      <q-btn icon="chevron_right"
             color="grey-8"
             size="sm"
             round
             dense
             flat
             :disable="scope.isLastPage"
             @click="scope.nextPage" />

      <q-btn v-if="scope.pagesNumber > 2"
             icon="last_page"
             color="grey-8"
             size="sm"
             round
             dense
             flat
             :disable="scope.isLastPage"
             @click="scope.lastPage" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n.ts'

  export type TableBottomScope = {
    pagesNumber: number
    isFirstPage: boolean
    isLastPage: boolean
    firstPage: () => {}
    lastPage: () => {}
    nextPage: () => {}
    prevPage: () => {}
    inFullscreen: boolean
    toggleFullscreen: () => {}
    pagination: {
      rowsPerPage: number
      page: number
      rowsNumber?: number
      sortBy: string | null
      descending: boolean
    }
  }

  type RowsPerPage = {
    label: string
    value: number
    enabled: boolean
    needsConfirm?: boolean
  }

  const props = defineProps<{
    scope: TableBottomScope,
    rowsPerPage: RowsPerPage[],
    total: number,
    modelValue: any
  }>()
  const t = useTranslation()

  const options = ref(props.rowsPerPage as RowsPerPage[])
  const perPage = ref(options.value.find((opt) => (opt.value === props.modelValue)))

  const emit = defineEmits(['update:modelValue', 'rowsPerPageAccepted'])
  const confirmAll = (opt: { enabled: boolean, label: string }) => {
    if (opt.enabled) {
      opt.enabled = false
    } else {
      if (confirm(t('shared.table_bottom.rows_per_page.confirm', { value: opt.label }))) opt.enabled = true
    }
    emit('rowsPerPageAccepted', opt.enabled)
  }
  watch(perPage, newValue => (newValue && emit('update:modelValue', newValue.value)))
  const firstRowIndex = computed(() => (props.scope.pagination.rowsPerPage * (props.scope.pagination.page - 1) + 1))
  const lastRowIndex = computed(() => (Math.min(props.scope.pagination.page * props.scope.pagination.rowsPerPage, props.scope.pagination.rowsNumber || props.total)))
</script>
