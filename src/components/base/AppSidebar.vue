<template>
  <q-drawer :model-value="true" behavior="desktop" persistent :width="sidebarStore.collapsed ? 60 : 232">
    <div class="column fit no-wrap overflow-hidden">
      <div class="row items-center no-wrap q-pt-md q-pb-sm">
        <q-item :to="routeTo('home')" class="col" dense :ripple="false">
          <q-item-section avatar>
            <img :src="logo" alt="Elasticvue" width="36" height="36" draggable="false" />
          </q-item-section>
          <q-item-section v-show="!sidebarStore.collapsed" class="text-weight-medium text-h5">Elasticvue</q-item-section>
        </q-item>
      </div>

      <div class="q-px-sm q-my-md">
        <cluster-selection :collapsed="sidebarStore.collapsed" class="q-mx-sm" />
      </div>

      <q-scroll-area class="col">
        <q-list dense padding :aria-label="t('base.app_header.label')">
          <template v-for="(section, index) in sections" :key="section.id">
            <q-separator v-if="index > 0" class="q-my-sm q-mx-md" color="bgbody-background" />
            <app-sidebar-item v-for="item in section.items" :key="item.id" :collapsed="sidebarStore.collapsed" v-bind="item" />
          </template>
        </q-list>
      </q-scroll-area>

      <div class="column items-start q-px-md q-pb-md q-gutter-xs">
        <div :class="sidebarStore.collapsed ? 'column q-gutter-y-xs' : 'row q-gutter-x-xs'">
          <theme-switcher :size="controlSize" />
          <language-switcher :size="controlSize" />
        </div>
      </div>
    </div>

    <div class="absolute-right column no-pointer-events">
      <q-btn
        round
        unelevated
        class="sidebar-collapse all-pointer-events shadow-2"
        style="margin-top: 142px"
        size="sm"
        :icon="sidebarStore.collapsed ? 'menu' : 'menu_open'"
        :title="sidebarStore.collapsed ? t('base.app_header.expand') : t('base.app_header.collapse')"
        :aria-expanded="!sidebarStore.collapsed"
        @click="sidebarStore.toggleCollapsed"
      />
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLogo } from '../../composables/Logo'
import { useTranslation } from '../../composables/i18n.ts'
import { useConnectionStore } from '../../store/connection'
import { useSidebarStore } from '../../store/sidebar'
import { supportsNativeSecurityApi } from '../../helpers/securitySupport.ts'
import ClusterSelection from '../clusterselection/ClusterSelection.vue'
import AppSidebarItem from './AppSidebarItem.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'

const t = useTranslation()
const logo = useLogo()
const connectionStore = useConnectionStore()
const sidebarStore = useSidebarStore()

const controlSize = computed(() => (sidebarStore.collapsed ? 'sm' : 'md'))

const routeTo = (name: string) => ({
  name,
  params: { clusterIndex: connectionStore.activeClusterIndex }
})

const sections = computed(() => {
  const serverless = connectionStore.serverless
  const securityDisabled = !supportsNativeSecurityApi()

  return [
    {
      id: 'cluster',
      items: [
        {
          id: 'home',
          label: t('base.app_header.navigation.home'),
          icon: 'home',
          to: routeTo('home'),
          activeNames: ['home'],
          disabled: false
        },
        {
          id: 'nodes',
          label: t('base.app_header.navigation.nodes'),
          icon: 'dns',
          to: routeTo('nodes'),
          activeNames: ['nodes'],
          disabled: serverless
        },
        {
          id: 'shards',
          label: t('base.app_header.navigation.shards'),
          icon: 'view_module',
          to: routeTo('shards'),
          activeNames: ['shards', 'shard_recovery'],
          disabled: serverless,
          children: [
            {
              id: 'shards_overview',
              label: t('base.app_header.navigation.shards_overview'),
              to: routeTo('shards'),
              activeNames: ['shards']
            },
            {
              id: 'shard_recovery',
              label: t('base.app_header.navigation.shard_recovery'),
              to: routeTo('shard_recovery'),
              activeNames: ['shard_recovery']
            }
          ]
        }
      ]
    },
    {
      id: 'data',
      items: [
        {
          id: 'indices',
          label: t('base.app_header.navigation.indices'),
          icon: 'storage',
          to: routeTo('indices'),
          activeNames: ['indices', 'index_templates'],
          disabled: false
        },
        {
          id: 'search',
          label: t('base.app_header.navigation.search'),
          icon: 'search',
          to: routeTo('search'),
          activeNames: ['search'],
          disabled: false
        }
      ]
    },
    {
      id: 'tools',
      items: [
        {
          id: 'rest',
          label: t('base.app_header.navigation.rest'),
          icon: 'terminal',
          to: routeTo('rest'),
          activeNames: ['rest'],
          disabled: false
        },
        {
          id: 'tools',
          label: t('base.app_header.navigation.tools'),
          icon: 'handyman',
          to: routeTo('tools'),
          activeNames: ['tools'],
          disabled: serverless
        },
        {
          id: 'snapshots',
          label: t('base.app_header.navigation.snapshots'),
          icon: 'backup',
          to: routeTo('snapshot_repositories'),
          activeNames: ['snapshot_repositories', 'snapshots'],
          disabled: serverless
        },
        {
          id: 'users',
          label: t('base.app_header.navigation.security'),
          icon: 'security',
          to: routeTo('users'),
          activeNames: ['users', 'roles'],
          disabled: securityDisabled,
          children: [
            {
              id: 'users_list',
              label: t('cluster_users.heading'),
              to: routeTo('users'),
              activeNames: ['users']
            },
            {
              id: 'roles',
              label: t('cluster_roles.heading'),
              to: routeTo('roles'),
              activeNames: ['roles']
            }
          ]
        }
      ]
    },
    {
      id: 'settings',
      items: [
        {
          id: 'settings',
          label: t('base.app_header.navigation.settings'),
          icon: 'settings',
          to: routeTo('settings'),
          activeNames: ['settings'],
          disabled: false
        }
      ]
    }
  ]
})
</script>

<style scoped>
:deep(.q-drawer__content) {
  overflow: visible;
}

.sidebar-collapse {
  background: var(--theme-sidebar-background);
  border: 1px solid var(--theme-separator-background);
  transform: translateX(50%);
}
</style>
