<template>
  <div v-if="requestState.apiError || requestState.networkError">
    <template v-if="requestState.apiError">
      <div class="pa-4">
        <v-alert :value="true">{{requestState.apiErrorMessage}}</v-alert>
      </div>
    </template>
    <template v-else-if="requestState.networkError">
      <div class="pa-4">
        <v-alert :value="true" color="grey">
          Network error: failed to fetch.
        </v-alert>
      </div>
    </template>
  </div>
  <div v-else>
    <v-progress-linear v-if="requestState.loading" color="blue" indeterminate/>
    <slot v-else/>
  </div>
</template>

<script>
  import { defineComponent } from '@vue/composition-api'

  export default defineComponent({
    name: 'loader',
    props: {
      requestState: {
        default: () => ({}),
        type: Object
      }
    },
    setup () {
    }
  })
</script>
