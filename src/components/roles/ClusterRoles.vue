<template>
  <div class="flex justify-between items-center q-mb-lg">
    <h1 class="page-title">{{ t('cluster_roles.heading') }}</h1>
    <reload-button :action="load" v-model="rolesStore.reloadInterval" />
  </div>

  <security-unavailable
    v-if="requestState.apiError"
    :status="requestState.status"
    :message="requestState.apiErrorMessage"
    subject="roles"
  />

  <template v-else>
    <roles-pulse v-if="roles.length" class="q-mb-lg" :summary="summary" :usage-known="usageKnown" />

    <q-card>
      <loader-status :request-state="requestState">
        <roles-table :roles="roles" :usage="usage" :usage-known="usageKnown" @reload="load" />
      </loader-status>
    </q-card>
  </template>
</template>

<script setup lang="ts">
import RolesTable from './RolesTable.vue'
import RolesPulse from './RolesPulse.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import ReloadButton from '../shared/ReloadButton.vue'
import SecurityUnavailable from '../shared/SecurityUnavailable.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useClusterRoles } from '../../composables/components/roles/ClusterRoles.ts'

const t = useTranslation()
const { rolesStore, requestState, roles, usage, usageKnown, summary, load } = useClusterRoles()
</script>
