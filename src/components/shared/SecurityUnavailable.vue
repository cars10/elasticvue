<template>
  <q-card data-testid="security-unavailable">
    <q-card-section class="row no-wrap items-start q-gutter-x-md">
      <q-icon :name="kind === 'forbidden' ? 'lock' : 'shield'" size="28px" class="text-muted" />
      <div>
        <div class="text-h6">{{ title }}</div>
        <div class="q-mt-xs">{{ text }}</div>
        <div v-if="message" class="text-muted font-13 font-mono q-mt-sm">{{ message }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { securityErrorKind } from '../../helpers/security.ts'
import { useTranslation } from '../../composables/i18n.ts'

const props = defineProps<{
  status: number
  message: string
  subject: 'users' | 'roles'
}>()

const t = useTranslation()

const kind = computed(() => securityErrorKind(props.status))

const title = computed(() =>
  kind.value !== 'forbidden'
    ? t('shared.security_unavailable.unavailable')
    : props.subject === 'users'
      ? t('shared.security_unavailable.forbidden_users')
      : t('shared.security_unavailable.forbidden_roles')
)

const text = computed(() =>
  kind.value === 'forbidden' ? t('shared.security_unavailable.forbidden_text') : t('shared.security_unavailable.unavailable_text')
)
</script>
