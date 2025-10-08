<template>
  <q-icon v-if="!SUPPORTED_MAJOR_VERSIONS.includes(majorVersion)" name="warning" color="warning" class="q-pl-xs">
    <q-tooltip class="bg-dark text-body2">
      {{
        t('cluster_selection.cluster_table.row.unsupported', {
          majorVersion: majorVersion,
          supportedVersions: SUPPORTED_MAJOR_VERSIONS.join(', ')
        })
      }}
    </q-tooltip>
  </q-icon>
</template>

<script setup lang="ts">
import { SUPPORTED_MAJOR_VERSIONS } from '../../consts'
import { useTranslation } from '../../composables/i18n'

const t = useTranslation()

defineProps<{ majorVersion: string }>()
</script>
