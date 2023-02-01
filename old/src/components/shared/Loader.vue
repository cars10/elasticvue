<template>
  <div v-if="requestState.apiError || requestState.networkError">
    <template v-if="requestState.apiError">
      <div class="pa-4">
        <v-alert :value="true" color="red" type="error">
          {{ requestState.apiErrorMessage }}<br>
          <v-btn class="mr-4" @click.native="copy">{{ $t('shared.loader.copy_error') }}</v-btn>
        </v-alert>
      </div>
    </template>
    <template v-else-if="requestState.networkError">
      <div class="pa-4">
        <v-alert :value="true" color="grey">
          {{ $t('shared.loader.network_error') }}
        </v-alert>
      </div>
    </template>
  </div>
  <div v-else>
    <v-progress-linear v-if="requestState.loading && !hideProgress" color="blue" indeterminate/>
    <slot/>
  </div>
</template>

<script>
  import { writeToClipboard } from '@/services/tauri/clipboard'

  export default {
    name: 'loader',
    props: {
      requestState: {
        default: () => ({}),
        type: Object
      },
      hideProgress: {
        default: false,
        type: Boolean
      }
    },
    setup (props) {
      const copy = () => {
        writeToClipboard(props.requestState.apiErrorMessage)
      }

      return {
        copy
      }
    }
  }
</script>
