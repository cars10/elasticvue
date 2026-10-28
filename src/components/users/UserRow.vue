<template>
  <tr>
    <td>
      <div class="text-weight-medium">{{ user.username }}</div>
      <div v-if="user.full_name" class="text-muted font-13">{{ user.full_name }}</div>
      <div v-if="user.email" class="text-muted font-13">{{ user.email }}</div>
    </td>
    <td>
      <div class="row q-gutter-xs">
        <q-badge
          v-for="role in user.roles"
          :key="role"
          class="cursor-pointer"
          :outline="role !== SUPERUSER_ROLE"
          :color="role === SUPERUSER_ROLE ? 'primary-dark' : 'primary'"
          :label="role"
          :title="t('cluster_users.show_role', { role })"
          @click="emit('show-role', role)"
        />
        <span v-if="!user.roles.length" class="health--yellow font-13">{{ t('cluster_users.no_roles') }}</span>
      </div>
    </td>
    <td>
      <div class="row q-gutter-xs">
        <q-badge v-if="!user.enabled" color="warning" text-color="dark" label="disabled" />
        <q-badge v-if="user.reserved" outline color="grey" label="built-in" />
        <q-badge v-if="user.deprecated" outline color="warning" label="deprecated">
          <q-tooltip v-if="user.deprecated_reason">{{ user.deprecated_reason }}</q-tooltip>
        </q-badge>
      </div>
    </td>
    <td class="text-right">
      <q-btn flat round dense icon="edit" data-testid="edit-user" @click="emit('edit', user)" />
      <q-btn flat round dense icon="delete" data-testid="delete-user" :disable="user.reserved" @click="deleteUser" />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { useUserRow } from '../../composables/components/users/UserRow.ts'
import { useTranslation } from '../../composables/i18n.ts'
import { SUPERUSER_ROLE } from '../../helpers/security.ts'
import type { ClusterUser } from '../../types/security.ts'

const props = defineProps<{ user: ClusterUser }>()
const emit = defineEmits<{ reload: []; edit: [user: ClusterUser]; 'show-role': [role: string] }>()

const t = useTranslation()
const { deleteUser } = useUserRow(props, emit)
</script>
