<template>
  <div v-if="requestState.apiError || requestState.networkError">
    <template v-if="requestState.apiError">
      <div class="pa-4">
        <q-banner class="bg-dark-grey">
          Error: {{ requestState.apiErrorMessage }}

          <template #action>
            <q-btn color="dark" @click="copy">
              {{ t('shared.loader.copy_error') }}
            </q-btn>
          </template>
        </q-banner>
      </div>
    </template>
    <template v-else-if="requestState.networkError">
      <div class="pa-4">
        <q-banner class="q-pa-md bg-default">
          {{ t('shared.loader.network_error') }}
        </q-banner>
      </div>
    </template>
  </div>

  <div v-else>
    <q-linear-progress v-if="requestState.loading" indeterminate />
    <slot />
  </div>
</template>

<script setup>
  import { writeToClipboard } from '../../helpers/clipboard'
  import { useTranslation } from '../../composables/i18n'

  const props = defineProps({
    requestState: {
      default: () => ({}),
      type: Object
    }
  })
  const t = useTranslation()
  const copy = () => {
    writeToClipboard(props.requestState.apiErrorMessage)
  }
</script>
