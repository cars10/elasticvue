<template>
  <q-menu v-model="open" no-refocus anchor="bottom right" self="top right" @before-show="name = initialName">
    <q-form class="row no-wrap items-center q-pa-sm q-gutter-x-sm" @submit.prevent="submit">
      <custom-input
        v-model="name"
        data-testid="rest-name-input"
        dense
        autofocus
        outlined
        :label="t('query.library.name')"
        style="min-width: 260px"
      />
      <q-btn
        type="submit"
        data-testid="rest-name-save"
        color="primary-dark"
        no-caps
        :disable="!name.trim()"
        :label="t('query.rest.form.save_request')"
      />
    </q-form>
  </q-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomInput from '../shared/CustomInput.vue'
import { useTranslation } from '../../composables/i18n.ts'

defineProps<{ initialName: string }>()
const emit = defineEmits<{ save: [name: string] }>()

const t = useTranslation()
const open = ref(false)
const name = ref('')

const submit = () => {
  if (!name.value.trim()) return

  emit('save', name.value.trim())
  open.value = false
}
</script>
