<template>
  <div class="row q-gutter-xs no-wrap" :title="nodeRoleTitle(roles)">
    <q-badge
      v-for="{ role, label } in nodeRoleLabels(roles, version)"
      :key="role"
      :outline="!isElectedMaster(role)"
      :color="isElectedMaster(role) ? 'primary-dark' : 'primary'"
      :label="label"
    />
  </div>
</template>

<script setup lang="ts">
import { nodeRoleLabels, nodeRoleTitle } from '../../helpers/nodes.ts'

const props = defineProps<{
  roles: string
  version?: string
  /** Elected master; its master badge is filled, master-eligible nodes stay outlined. */
  master: boolean
}>()

const isElectedMaster = (role: string) => props.master && role === 'm'
</script>
