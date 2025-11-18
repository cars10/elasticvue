<template>
  <q-card class="q-mb-md">
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ t('security.heading') }}
      </h1>      
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-pt-sm">
        <div class="col-lg-8 offset-lg-2">
          <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
            <q-tab name="roles" >              
              <div class="flex">
                <h2 class="text-h5 q-my-none">
                  <q-icon name="security" />
                  {{ t('security.roles') }} 
                </h2>
              </div>              
            </q-tab>

            <q-tab name="apikeys" >
              <div class="flex">
                <h2 class="text-h5 q-my-none">
                  <q-icon name="vpn_key" />
                  {{ t('security.apikeys') }} 
                </h2>
              </div>              
            </q-tab>

            <q-tab name="users" >
              <div class="flex">
                <h2 class="text-h5 q-my-none">
                  <q-icon name="people" />
                  {{ t('security.users') }} 
                </h2>
              </div>              
            </q-tab>
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="roles">
              <roles-table ref="roles" />
            </q-tab-panel>

            <q-tab-panel name="apikeys">
              <api-keys-table ref="apikeys" />
            </q-tab-panel>

            <q-tab-panel name="users">
              <users-table ref="users" />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>


<script setup lang="ts">
  import RolesTable from './RolesTable.vue'
  import ApiKeysTable from './ApiKeysTable.vue'
  import UsersTable from './UsersTable.vue'
  import { Ref, ref } from 'vue'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()
  
  const tab = ref('roles')

  const roles: Ref<typeof RolesTable | null> = ref(null)
  const apikeys: Ref<typeof ApiKeysTable | null> = ref(null)
  const users: Ref<typeof UsersTable | null> = ref(null)
</script>