<template>
  <v-row>
    <v-col lg="8" offset-lg="2">
      <v-card>
        <v-card-title>
          <h1 class="headline">Utilities</h1>
        </v-card-title>
        <v-divider/>

        <v-card-text>
          <v-row>
            <v-col md="6">
              <v-subheader>Create</v-subheader>
              <v-divider/>
              <v-list>
                <template v-for="utility in utilities.create">
                  <utility :confirm-message="utility.confirmMessage"
                           :key="utility.method"
                           :method="utility.method"
                           :method-params="utility.methodParams"
                           :name="'utility_create_' + utility.method"
                           :text="utility.text"/>
                </template>
              </v-list>
            </v-col>

            <v-col md="6">
              <v-subheader>Delete</v-subheader>
              <v-divider/>
              <v-list>
                <template v-for="utility in utilities.delete">
                  <utility :confirm-message="utility.confirmMessage"
                           :key="utility.method"
                           :method="utility.method"
                           :method-params="utility.methodParams"
                           :name="'utility_delete_' + utility.method"
                           :text="utility.text"/>
                </template>
              </v-list>
            </v-col>

            <v-col md="6">
              <v-subheader>Misc</v-subheader>
              <v-divider/>
              <v-list>
                <template v-for="utility in utilities.misc">
                  <utility :confirm-message="utility.confirmMessage"
                           :key="utility.method"
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
    name: 'Utilities',
    components: {
      Utility
    },
    data () {
      return {
        utilities: {
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
              method: 'indicesDelete',
              methodParams: { index: '_all' }
            }
          ],
          misc: [
            {
              text: 'Flush all indices to disk',
              method: 'indicesFlush',
              methodParams: { index: '_all' }
            },
            {
              text: 'Set all indices to writable',
              method: 'indicesPutSettings',
              methodParams: {
                index: '_all', body: { 'index': { 'blocks': { 'read_only_allow_delete': 'false' } } }
              }
            }
          ]
        }
      }
    }
  }
</script>
