<template>
  <q-item
    v-if="!disabled"
    :id="id"
    :to="to"
    clickable
    dense
    :active="active"
    :aria-current="active ? 'page' : undefined"
    :title="collapsed ? label : undefined"
  >
    <q-item-section avatar style="min-width: 20px">
      <q-icon :name="icon" size="20px" />
    </q-item-section>

    <q-item-section v-show="!collapsed">{{ label }}</q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  id: string
  label: string
  icon: string
  to: RouteLocationRaw
  activeNames: string[]
  disabled: boolean
  collapsed: boolean
}>()

const route = useRoute()

const active = computed(() => props.activeNames.includes(String(route.name)))
</script>
