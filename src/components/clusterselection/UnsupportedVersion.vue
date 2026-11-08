<template>
  <q-icon v-if="message" name="warning" color="warning" class="q-pl-xs" data-testid="unsupported-cluster">
    <q-tooltip class="bg-dark text-body2">{{ message }}</q-tooltip>
  </q-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SUPPORTED_MAJOR_VERSIONS, SUPPORTED_OPENSEARCH_MAJOR_VERSIONS } from '../../consts'
import { useTranslation } from '../../composables/i18n'
import { isOpensearch, isSupportedDistribution, isSupportedVersion, parseMajorVersion, productName } from '../../helpers/clusterInfo.ts'

const t = useTranslation()

const props = defineProps<{ distribution?: string; version?: string }>()

const message = computed(() => {
  if (!isSupportedDistribution(props.distribution)) {
    return t('cluster_selection.cluster_table.row.unsupported_distribution', {
      product: productName(props.distribution) || t('cluster_selection.cluster_table.row.unknown_product')
    })
  }
  if (isSupportedVersion(props)) return null

  const supportedVersions = isOpensearch(props.distribution) ? SUPPORTED_OPENSEARCH_MAJOR_VERSIONS : SUPPORTED_MAJOR_VERSIONS
  return t('cluster_selection.cluster_table.row.unsupported', {
    product: productName(props.distribution),
    majorVersion: parseMajorVersion(props.version || ''),
    supportedVersions: supportedVersions.join(', ')
  })
})
</script>
