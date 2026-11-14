<template>
  <template v-if="!disabled">
    <q-item
      v-if="collapsed || !children?.length"
      style="min-height: 40px"
      :id="id"
      :to="to"
      clickable
      :active="isActive(props)"
      :aria-current="isActive(props) && !children?.length ? 'page' : undefined"
      :title="collapsed && !children?.length ? label : undefined"
      @mouseenter="flyout = hasFlyout"
      @mouseleave="closeFlyout"
    >
      <q-item-section avatar style="min-width: 20px">
        <q-icon :name="icon" size="20px" />
      </q-item-section>

      <q-item-section v-show="!collapsed" class="ellipsis">{{ label }}</q-item-section>

      <q-menu
        v-if="hasFlyout"
        v-model="flyout"
        class="app-sidebar-flyout"
        anchor="top right"
        self="top left"
        no-parent-event
        :transition-duration="0"
        @mouseleave="closeFlyout"
      >
        <q-list dense style="min-width: 160px">
          <q-item-label header class="q-py-sm">{{ label }}</q-item-label>
          <q-item
            v-for="child in children"
            :key="child.id"
            :to="child.to"
            clickable
            :active="isActive(child)"
            @click="flyout = false"
          >
            <q-item-section>{{ child.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-item>

    <q-expansion-item
      v-else
      v-model="open"
      :id="id"
      :header-style="{ minHeight: '40px' }"
      :header-class="{ 'text-primary': isActive(props) && !open }"
    >
      <template #header>
        <q-item-section avatar style="min-width: 20px">
          <q-icon :name="icon" size="20px" />
        </q-item-section>
        <q-item-section class="ellipsis">{{ label }}</q-item-section>
      </template>

      <q-item
        v-for="child in children"
        :id="child.id"
        :key="child.id"
        :to="child.to"
        class="app-sidebar-item__child"
        clickable
        dense
        :active="isActive(child)"
        :aria-current="isActive(child) ? 'page' : undefined"
      >
        <q-item-section class="ellipsis">{{ child.label }}</q-item-section>
      </q-item>
    </q-expansion-item>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'

type SidebarChild = {
  id: string
  label: string
  to: RouteLocationRaw
  activeNames: string[]
}

const props = defineProps<{
  id: string
  label: string
  icon: string
  to: RouteLocationRaw
  activeNames: string[]
  disabled: boolean
  collapsed: boolean
  children?: SidebarChild[]
}>()

const route = useRoute()

const isActive = (item: { activeNames: string[] }) => item.activeNames.includes(String(route.name))

const open = ref(isActive(props))
watch(
  () => isActive(props),
  (active) => {
    if (active) open.value = true
  }
)

const hasFlyout = computed(() => props.collapsed && !!props.children?.length)
const flyout = ref(false)

const closeFlyout = (event: MouseEvent) => {
  if (!(event.relatedTarget as Element | null)?.closest('.app-sidebar-flyout')) flyout.value = false
}
</script>

<style scoped>
.app-sidebar-item__child {
  min-height: 32px;
  padding-left: 52px;
}
</style>
