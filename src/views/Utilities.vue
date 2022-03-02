<template>
  <v-row>
    <v-col lg="8" offset-lg="2">
      <v-card>
        <v-card-title>
          <h1 class="text-h5">{{ $t('utilities.heading') }}</h1>
        </v-card-title>
        <v-divider/>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6" sm="12">
              <v-subheader class="text-h6">{{ $t('utilities.create.heading') }}</v-subheader>
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
              <v-subheader class="text-h6">{{ $t('utilities.delete.heading') }}</v-subheader>
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
              <v-subheader class="text-h6">{{ $t('utilities.misc.heading') }}</v-subheader>
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
  import i18n from '@/i18n'
  import Utility from '@/components/Utilities/Utility'
  import data from '../data'
  import store from '@/store'

  export default {
    name: 'utilities',
    components: {
      Utility
    },
    setup () {
      const UTILITIES = {
        create: [
          {
            text: i18n.t('utilities.create.empty_indices'),
            method: 'createIndices',
            methodParams: ['articles', 'comments', 'documents', 'images', 'orders', 'posts', 'profiles', 'tweets', 'users', 'vendors']
          },
          {
            text: i18n.t('utilities.create.twitter_index'),
            method: 'bulk',
            methodParams: { body: data }
          }
        ],
        delete: [
          {
            text: i18n.t('utilities.delete.delete_all'),
            confirmMessage: i18n.t('utilities.delete.confirm'),
            method: 'indexDelete',
            methodParams: { index: '_all' }
          }
        ],
        misc: [
          {
            text: i18n.t('utilities.misc.flush_all'),
            method: 'indexFlush',
            methodParams: { index: '_all' }
          },
          {
            text: i18n.t('utilities.misc.set_all_to_writable'),
            method: 'indexPutSettings',
            methodParams: {
              index: '_all', body: { index: { blocks: { read_only_allow_delete: 'false' } } }
            }
          }
        ]
      }

      const instance = store.getters['connection/activeInstance']
      if (instance.major_version >= 8) delete UTILITIES.delete

      return {
        UTILITIES
      }
    }
  }
</script>
