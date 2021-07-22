<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon small v-bind="attrs" v-on="on" ripple title="Rename cluster">
        <v-icon small>mdi-pencil-outline</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="text-h5">
        <h2 class="text-h5">{{ $t('es.rename.rename-es-instance') }}</h2>
        <div class="ml-a">
          <v-btn icon title="Close" @click.native="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider/>
      <v-form ref="form" v-model="valid" @submit.prevent="rename">
        <v-card-text>
          <v-text-field v-if="dialog"
                        v-model="newName"
                        :rules="[validName]"
                        autocomplete="off"
                        autofocus
                        :label="$t('es.rename.cluster-name')"
                        name="name"
                        required/>

          <v-text-field :value="clusterUri"
                        disabled
                        :label="$t('es.rename.uri')"
                        name="uri"/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn :disabled="!valid" class="mr-2" color="success" type="submit">{{ $t('es.rename.rename') }}</v-btn>
          <v-btn text @click="closeDialog">{{ $t('es.rename.cancel') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import { ref } from '@vue/composition-api'
  import store from '@/store'

  export default {
    name: 'rename-elasticsearch-instance',
    props: {
      clusterName: {
        type: String,
        default: ''
      },
      clusterUri: {
        type: String,
        default: ''
      },
      clusterIdx: {
        type: Number,
        default: -1
      }
    },
    setup (props) {
      const dialog = ref(false)
      const valid = ref(false)
      const newName = ref(props.clusterName)

      const closeDialog = () => {
        dialog.value = false
      }

      const validName = () => {
        return newName.value.trim().length > 0 || 'Invalid'
      }

      const rename = () => {
        store.commit('connection/renameElasticsearchInstance', { name: newName.value.trim(), index: props.clusterIdx })
        closeDialog()
      }

      return {
        dialog,
        valid,
        validName,
        closeDialog,
        newName,
        rename
      }
    }
  }
</script>
