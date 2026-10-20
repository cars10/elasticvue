<template>
  <div class="row q-col-gutter-lg" data-testid="users-pulse">
    <div v-if="currentUser?.username" class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card title="Signed in as" icon="badge" :value="currentUser.username" test-id="users-pulse-current">
        <div v-if="currentUser.roles?.length" class="text-muted font-13 q-mt-xs">{{ currentUser.roles.join(', ') }}</div>
        <div v-if="currentUser.authentication_realm?.name" class="text-muted font-13 q-mt-xs">
          realm {{ currentUser.authentication_realm.name }}
        </div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card title="Users" icon="group" :value="summary.total" test-id="users-pulse-total">
        <div class="text-muted font-13 q-mt-xs">{{ summary.builtIn }} built-in · {{ summary.custom }} custom</div>
        <div v-if="showEnabled" class="text-muted font-13 q-mt-xs">{{ summary.disabled }} disabled</div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        title="Superusers"
        icon="admin_panel_settings"
        :value="summary.superusers.length"
        test-id="users-pulse-superusers"
      >
        <div class="text-muted font-13 q-mt-xs">{{ namePreview(summary.superusers) }}</div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        title="Without roles"
        icon="person_off"
        :value="summary.withoutRoles.length"
        :value-class="summary.withoutRoles.length ? 'health--yellow' : undefined"
        test-id="users-pulse-without-roles"
      >
        <div class="text-muted font-13 q-mt-xs">{{ namePreview(summary.withoutRoles) }}</div>
      </pulse-metric-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { supportsUserEnabledInBody } from '../../helpers/securitySupport.ts'
import { namePreview } from '../../helpers/security.ts'
import type { AuthenticatedUser, UsersSummary } from '../../types/security.ts'

const props = defineProps<{
  summary: UsersSummary
  currentUser: AuthenticatedUser | null
}>()

const showEnabled = supportsUserEnabledInBody()

const colClass = computed(() => (props.currentUser?.username ? 'col-12 col-sm-6 col-lg-3' : 'col-12 col-sm-4'))
</script>
