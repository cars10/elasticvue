<template>
  <div class="row q-col-gutter-md" data-testid="users-pulse">
    <div v-if="currentUser?.username" class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        :title="t('cluster_users.pulse.signed_in')"
        icon="badge"
        :value="currentUser.username"
        test-id="users-pulse-current"
      >
        <div v-if="currentUser.roles?.length" class="text-muted font-13 q-mt-xs">{{ currentUser.roles.join(', ') }}</div>
        <div v-if="currentUser.authentication_realm?.name" class="text-muted font-13 q-mt-xs">
          {{ t('cluster_users.pulse.realm', { realm: currentUser.authentication_realm.name }) }}
        </div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card :title="t('cluster_users.pulse.users')" icon="group" :value="summary.total" test-id="users-pulse-total">
        <div class="text-muted font-13 q-mt-xs">
          {{ t('cluster_users.pulse.split', { builtIn: summary.builtIn, custom: summary.custom }) }}
        </div>
        <div v-if="showEnabled" class="text-muted font-13 q-mt-xs">
          {{ t('cluster_users.pulse.disabled', { count: summary.disabled }) }}
        </div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        :title="t('cluster_users.pulse.superusers')"
        icon="admin_panel_settings"
        :value="summary.superusers.length"
        test-id="users-pulse-superusers"
      >
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        :title="t('cluster_users.pulse.without_roles')"
        icon="person_off"
        :value="summary.withoutRoles.length"
        :value-class="summary.withoutRoles.length ? 'health--yellow' : undefined"
        test-id="users-pulse-without-roles"
      >
      </pulse-metric-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { supportsUserEnabledInBody } from '../../helpers/securitySupport.ts'
import type { AuthenticatedUser, UsersSummary } from '../../types/security.ts'

const props = defineProps<{
  summary: UsersSummary
  currentUser: AuthenticatedUser | null
}>()

const t = useTranslation()
const showEnabled = supportsUserEnabledInBody()

const colClass = computed(() => (props.currentUser?.username ? 'col-12 col-sm-6 col-lg-3' : 'col-12 col-sm-4'))
</script>
