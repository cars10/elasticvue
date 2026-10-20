<template>
  <q-card data-testid="security-unavailable">
    <q-card-section class="row no-wrap items-start q-gutter-x-md">
      <q-icon :name="kind === 'forbidden' ? 'lock' : 'shield'" size="32px" color="primary" />
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

const props = defineProps<{
  status: number
  message: string
  subject: string
}>()

const kind = computed(() => securityErrorKind(props.status))

const title = computed(() =>
  kind.value === 'forbidden' ? `Not allowed to read ${props.subject}` : 'Security is not available on this cluster'
)

const text = computed(() =>
  kind.value === 'forbidden'
    ? 'Your user needs the manage_security cluster privilege to manage users and roles.'
    : 'Native users and roles need the Elasticsearch security features (X-Pack), which are missing or disabled on this cluster.'
)
</script>
