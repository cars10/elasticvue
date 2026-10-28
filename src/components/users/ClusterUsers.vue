<template>
  <div class="flex justify-between items-center q-mb-lg">
    <h1 class="page-title">{{ t('cluster_users.heading') }}</h1>
    <reload-button :action="load" v-model="usersStore.reloadInterval" />
  </div>

  <security-unavailable
    v-if="requestState.apiError"
    :status="requestState.status"
    :message="requestState.apiErrorMessage"
    subject="users"
  />

  <template v-else>
    <users-pulse v-if="users.length" class="q-mb-lg" :summary="summary" :current-user="currentUser" />

    <q-card>
      <loader-status :request-state="requestState">
        <users-table :users="users" @reload="load" />
      </loader-status>
    </q-card>
  </template>
</template>

<script setup lang="ts">
import UsersTable from './UsersTable.vue'
import UsersPulse from './UsersPulse.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import ReloadButton from '../shared/ReloadButton.vue'
import SecurityUnavailable from '../shared/SecurityUnavailable.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useClusterUsers } from '../../composables/components/users/ClusterUsers.ts'

const t = useTranslation()
const { usersStore, requestState, users, currentUser, summary, load } = useClusterUsers()
</script>
