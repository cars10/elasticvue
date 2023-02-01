<template>
  <v-dialog v-model="dialog" :width="width">
    <v-card>
      <v-card-title>
        <h2 class="text-h5">{{ modalTitle }}</h2>
        <reload-button id="reload-modal" :action="load"/>
        <div class="ml-a">
          <v-btn :title="$t('defaults.close')" icon @click.native="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-divider/>

      <v-card-text class="pt-2">
        <loader :request-state="requestState">
          <print-pretty :caption="modalSubtitle"
                        :document="data"
                        :initial-height="calculatedHeight()"
                        :resizable="false"/>
        </loader>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import PrintPretty from '@/components/shared/PrintPretty'
  import ReloadButton from '@/components/shared/ReloadButton'
  import { onBeforeUnmount, ref, watch } from 'vue'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import Loader from '@/components/shared/Loader'
  import i18n from '@/i18n'

  export default {
    name: 'modal-data-loader',
    components: {
      Loader,
      PrintPretty,
      ReloadButton
    },
    props: {
      width: {
        type: String,
        default: '1000'
      },
      method: {
        type: String,
        default: ''
      },
      methodParams: {
        default: () => {
          return {}
        },
        type: Object
      },
      modalTitle: {
        default: i18n.t('shared.modal_data_loader.modal_title.default'),
        type: String
      },
      modalSubtitle: {
        default: '',
        type: String
      },
      value: {
        default: false,
        type: Boolean
      }
    },
    setup (props, context) {
      const dialog = ref(false)
      const data = ref({})
      const { callElasticsearch, requestState } = useElasticsearchRequest()

      watch(dialog, newValue => {
        if (newValue) {
          load()
          window.addEventListener('keydown', closeOnEsc)
        } else {
          window.removeEventListener('keydown', closeOnEsc)
          context.emit('input', newValue)
        }
      })

      const load = () => {
        callElasticsearch(props.method, props.methodParams)
          .then(r => (data.value = r))
      }

      watch(() => props.value, value => {
        if (value) dialog.value = true
      })

      onBeforeUnmount(() => {
        window.removeEventListener('keydown', closeOnEsc)
      })

      const close = () => (dialog.value = false)
      const calculatedHeight = () => (window.innerHeight * 0.7)
      const closeOnEsc = e => {
        if (e.keyCode === 27) close()
      }

      return {
        dialog,
        requestState,
        load,
        data,
        close,
        calculatedHeight
      }
    }
  }
</script>
