<template>
  <tr class="clickable" @click="expand = !expand">
    <td>
      <q-icon :name="expand ? 'expand_less' : 'expand_more'" />
    </td>
    <td>
      <div class="text-weight-medium">{{ role.name }}</div>
      <div v-if="showDescription && role.description" class="text-muted font-13">{{ role.description }}</div>
    </td>
    <td>
      <div class="row q-gutter-xs">
        <q-badge
          v-for="privilege in role.cluster"
          :key="privilege"
          :outline="!isClusterAdminPrivilege(privilege)"
          :color="isClusterAdminPrivilege(privilege) ? 'primary-dark' : 'primary'"
          :label="privilege"
        />
      </div>
    </td>
    <td v-if="usageKnown" @click.stop>
      <a v-if="usage?.users.length" href="#" :title="usage.users.join(', ')" @click.prevent="emit('show-users', role.name)">
        {{ usage.users.length }} {{ usage.users.length === 1 ? 'user' : 'users' }}
      </a>
      <div v-if="usage?.mappings" class="text-muted font-13">
        {{ usage.mappings }} {{ usage.mappings === 1 ? 'mapping' : 'mappings' }}
      </div>
      <span v-if="!usage?.users.length && !usage?.mappings" class="text-muted">—</span>
    </td>
    <td>
      <div class="row q-gutter-xs">
        <q-badge v-if="role.reserved" outline color="grey" label="built-in" />
        <q-badge v-if="role.deprecated" outline color="warning" label="deprecated">
          <q-tooltip v-if="role.deprecated_reason">{{ role.deprecated_reason }}</q-tooltip>
        </q-badge>
      </div>
    </td>
    <td class="text-right" @click.stop>
      <q-btn flat round dense icon="edit" data-testid="edit-role" :disable="role.reserved" @click="emit('edit', role)" />
      <q-btn flat round dense icon="delete" data-testid="delete-role" :disable="role.reserved" @click="deleteRole" />
    </td>
  </tr>

  <tr v-if="expand">
    <td colspan="100%">
      <div class="q-pa-md">
        <resizable-container>
          <code-viewer :value="stringifyJson(role.raw)" />
        </resizable-container>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import ResizableContainer from '../shared/ResizableContainer.vue'
import { useRoleRow } from '../../composables/components/roles/RoleRow.ts'
import { supportsRoleDescription } from '../../helpers/securitySupport.ts'
import { isClusterAdminPrivilege } from '../../helpers/security.ts'
import type { ClusterRole, RoleUsage } from '../../types/security.ts'
import { stringifyJson } from '../../helpers/json/stringify.ts'

const CodeViewer = defineAsyncComponent(() => import('../shared/CodeViewer.vue'))

const props = defineProps<{ role: ClusterRole; usage?: RoleUsage; usageKnown: boolean }>()
const emit = defineEmits<{ reload: []; edit: [role: ClusterRole]; 'show-users': [role: string] }>()
const expand = ref(false)

const showDescription = supportsRoleDescription()
const { deleteRole } = useRoleRow(props, emit)
</script>
