<template>
  <v-dialog v-model="ownDialog" max-width="800">
    <v-card>
      <v-card-title>
        <h2 class="text-h5">Download location</h2>

        <div class="ml-a">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on" class="grey--text text--small text-center">
                <v-icon small>mdi-help-circle</v-icon>
                Whats this?
              </span>
            </template>
            <div>
              Elasticvue uses tauri for the desktop app. Tauri does not yet support file downloads so we have to ship
              our own for now.
            </div>
          </v-tooltip>
          <v-btn icon :title="$t('defaults.close')" @click.native="ownDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

      </v-card-title>
      <v-divider/>

      <v-container>
        <v-row>
          <v-col cols="3">
            <v-list v-if="userDirectories.length > 0" dense color="transparent">
              <div class="grey--text mb-2">Places</div>
              <v-list-item v-for="place in userDirectories"
                           :key="place.path"
                           class="px-2"
                           @click="renderTree(place.path)">
                <v-list-item-icon class="mr-0">
                  <v-icon small>mdi-folder</v-icon>
                </v-list-item-icon>
                <v-list-item-content :title="place.path">
                  <v-list-item-title v-text="place.name"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-col>
          <v-divider vertical/>

          <v-col cols="9">
            <v-text-field solo
                          dense
                          label="Path"
                          v-model="directoriesPath"
                          hide-details
                          append-icon="mdi-send"
                          @click:append="renderTree(directoriesPath)"
                          @keydown.enter="renderTree(directoriesPath)"
                          class="mb-1"/>

            <v-row class="mb-2">
              <v-col cols="6">
                <v-btn @click="navigateToParent" class="mt-3" small>
                  <v-icon>mdi-arrow-left</v-icon>
                  back
                </v-btn>
              </v-col>

              <v-col>
                <v-text-field v-model="filter"
                              :label="$t('defaults.filter.label')"
                              append-icon="mdi-magnify"
                              class="mt-0"
                              single-line
                              autofocus
                              hide-details
                              name="filter"/>
              </v-col>
            </v-row>
            <v-divider/>

            <div style="height: 350px;" class="overflow-y-auto mt-1">
              <v-treeview v-model="tree"
                          v-if="filteredDirectories.length > 0"
                          :items="filteredDirectories"
                          item-text="file_name"
                          item-key="path"
                          style="font-size: 90%"
                          dense
                          activatable
                          open-on-click
                          :load-children="loadChildren">
                <template v-slot:prepend="{ item, open }">
                  <v-icon v-if="item.is_dir">
                    {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                  </v-icon>
                  <v-icon v-else class="grey--text">mdi-file</v-icon>
                </template>
              </v-treeview>
              <div class="text-center grey--text text--small my-2">
                <i>{{ filteredDirectories.length }} files in {{ directoriesPath }}</i>
              </div>
            </div>

            <v-divider/>

            <v-card-actions class="d-block px-0 pb-0">
              <v-form @submit.prevent="saveFile">
                <v-text-field v-model="fileName" label="Filename" :rules="[filenameRequired]" class="mb-4"/>

                <v-btn color="success" type="submit" class="mr-2">Save here</v-btn>
                <v-btn text @click="ownDialog = false">Cancel</v-btn>

                <v-alert v-if="errorMessage" :value="true" color="error" class="mt-4">
                  <v-icon>mdi-alert-circle</v-icon>
                  {{ errorMessage }}
                </v-alert>
              </v-form>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
  import { ref, computed, watch } from '@vue/composition-api'
  import { invoke } from '@tauri-apps/api/tauri'
  import { showSuccessSnackbar } from '@/mixins/ShowSnackbar'

  export default {
    name: 'file-chooser',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      initialFileName: {
        type: String,
        default: 'file.txt'
      },
      generateDownloadData: {
        type: Function,
        default: () => {
        }
      }
    },
    setup (props, context) {
      const ownDialog = computed({
        get: () => (props.value),
        set: value => context.emit('input', value)
      })
      const filter = ref('')
      const fileName = ref(props.initialFileName)

      const filteredDirectories = computed(() => {
        const cleanFilter = filter.value.toLowerCase().trim()
        return directories.value.filter(d => d.clean_file_name.includes(cleanFilter))
      })

      const directories = ref([])
      const directoriesPath = ref(null)
      const listDirs = path => (invoke('list', { path }))
      const renderTree = path => {
        listDirs(path).then(directoryList => {
          filter.value = ''
          directoriesPath.value = directoryList.path
          directories.value = directoryList.children.map(d => Object.assign({}, d, {
            disabled: !d.is_dir,
            children: d.is_dir ? [] : null
          }))
        })
      }
      const tree = ref([])
      watch(() => props.value, value => {
        if (value) renderTree()
      })

      const loadChildren = item => {
        renderTree(item.path)
      }

      const navigateToParent = () => {
        renderTree(directoriesPath.value + '/..')
      }

      const errorMessage = ref(null)

      const saveFile = () => {
        errorMessage.value = null

        const data = props.generateDownloadData()
        const options = { path: directoriesPath.value, fileName: fileName.value, data }
        invoke('save_file', options).then(result => {
          if (result.success) {
            ownDialog.value = false
            errorMessage.value = null

            showSuccessSnackbar({
              title: `File '${fileName.value}' saved`,
              body: `Saved in '${directoriesPath.value}'.`
            })
          } else {
            errorMessage.value = result.error_msg
          }
        })
      }

      watch(fileName, () => (errorMessage.value = null))

      const filenameRequired = () => (fileName.value.length > 0 || 'Required')

      const userDirectories = ref([])
      invoke('user_dirs').then(places => {
        if (places.root) userDirectories.value.push({ name: '/', path: places.root })
        if (places.home) userDirectories.value.push({ name: 'Home', path: places.home })
        if (places.download) userDirectories.value.push({ name: 'Downloads', path: places.download })
        if (places.desktop) userDirectories.value.push({ name: 'Desktop', path: places.desktop })
        if (places.document) userDirectories.value.push({ name: 'Documents', path: places.document })
      })

      return {
        filteredDirectories,
        errorMessage,
        fileName,
        ownDialog,
        filter,
        tree,
        directoriesPath,
        directories,
        loadChildren,
        navigateToParent,
        saveFile,
        filenameRequired,
        renderTree,
        userDirectories
      }
    }
  }
</script>
