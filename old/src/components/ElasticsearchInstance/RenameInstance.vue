<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" icon ripple small
             :title="$t('elasticsearch_instance.rename_instance.rename.title')">
        <v-icon small>mdi-pencil-outline</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="text-h5">
        <h2 class="text-h5">{{ $t('elasticsearch_instance.rename_instance.heading') }}</h2>
        <div class="ml-a">
          <v-btn icon :title="$t('defaults.close')" @click.native="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider/>
      <v-form ref="form" v-model="valid" @submit.prevent="rename">
        <v-card-text>
          <v-text-field v-if="dialog"
                        v-model="newName"
                        :label="$t('elasticsearch_instance.rename_instance.form.name.label')"
                        :rules="[validName]"
                        autocomplete="off"
                        autofocus
                        name="name"
                        required/>

          <v-text-field :label="$t('elasticsearch_instance.rename_instance.form.uri.label')"
                        :value="clusterUri"
                        disabled
                        name="uri"/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn :disabled="!valid" class="mr-2" color="success" type="submit">
            {{ $t('elasticsearch_instance.rename_instance.form.rename') }}
          </v-btn>
          <v-btn text @click="closeDialog">{{ $t('defaults.cancel') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import { ref, watch } from 'vue'
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

      watch(() => props.clusterName, value => (newName.value = value))

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
