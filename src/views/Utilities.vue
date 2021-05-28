<template>
  <v-row>
    <v-col lg="8" offset-lg="2">
      <v-card>
        <v-card-title>
          <h1 class="text-h5">Utilities</h1>
        </v-card-title>
        <v-divider/>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6" sm="12">
              <v-subheader class="text-h6">Create</v-subheader>
              <v-divider/>
              <v-list>
                <template v-for="utility in UTILITIES.create">
                  <utility :key="utility.method"
                           :confirm-message="utility.confirmMessage"
                           :method="utility.method"
                           :method-params="utility.methodParams"
                           :name="'utility_create_' + utility.method"
                           :text="utility.text"/>
                </template>
              </v-list>
            </v-col>

            <v-col cols="12" md="6" sm="12">
              <v-subheader class="text-h6">Delete</v-subheader>
              <v-divider/>
              <v-list>
                <template v-for="utility in UTILITIES.delete">
                  <utility :key="utility.method"
                           :confirm-message="utility.confirmMessage"
                           :method="utility.method"
                           :method-params="utility.methodParams"
                           :name="'utility_delete_' + utility.method"
                           :text="utility.text"/>
                </template>
              </v-list>
            </v-col>

            <v-col cols="12" md="6" sm="12">
              <v-subheader class="text-h6">Misc</v-subheader>
              <v-divider/>
              <v-list>
                <template v-for="utility in UTILITIES.misc">
                  <utility :key="utility.method"
                           :confirm-message="utility.confirmMessage"
                           :method="utility.method"
                           :method-params="utility.methodParams"
                           :name="'utility_misc_' + utility.method"
                           :text="utility.text"/>
                </template>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import Utility from '@/components/Utilities/Utility'
  import data from '../data'

  export default {
    name: 'utilities',
    components: {
      Utility
    },
    setup () {
      const UTILITIES = {
        create: [
          {
            text: 'Create 10 empty indices',
            method: 'createIndices',
            methodParams: ['articles', 'comments', 'documents', 'images', 'orders', 'posts', 'profiles', 'tweets', 'users', 'vendors']
          },
          {
            text: 'Create twitter index and add 100 tweets',
            method: 'bulk',
            methodParams: { body: data }
          }
        ],
        delete: [
          {
            text: 'Delete all indices',
            confirmMessage: 'Are you sure? This will delete ALL data in your cluster!',
            method: 'indexDelete',
            methodParams: { index: '_all' }
          }
        ],
        misc: [
          {
            text: 'Flush all indices to disk',
            method: 'indexFlush',
            methodParams: { index: '_all' }
          },
          {
            text: 'Set all indices to writable',
            method: 'indexPutSettings',
            methodParams: {
              index: '_all', body: { index: { blocks: { read_only_allow_delete: 'false' } } }
            }
          }
        ]
      }

      return {
        UTILITIES
      }
    }
  }
</script>
