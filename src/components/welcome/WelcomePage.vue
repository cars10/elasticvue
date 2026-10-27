<template>
  <div class="welcome-page q-mx-auto">
    <div class="row items-center no-wrap q-gutter-x-sm">
      <img :src="logo" alt="" height="40" width="40" draggable="false" />
      <h1 class="page-title">Elasticvue</h1>
    </div>
    <p class="text-muted q-mt-sm q-mb-xl">{{ t('welcome.welcome_page.intro') }}</p>

    <p class="font-14 q-mb-md">
      {{ t('welcome.welcome_page.first_time') }}
      {{ t('welcome.welcome_page.add_clusters') }}
    </p>

    <q-card>
      <q-list separator>
        <q-item id="add_cluster" clickable class="q-py-md" @click="setupDialog = true">
          <q-item-section avatar>
            <q-icon name="add" color="primary" />
          </q-item-section>
          <q-item-section>{{ t('setup.setup_instance.heading') }}</q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

        <q-item clickable class="q-py-md" @click="importDialog = true">
          <q-item-section avatar>
            <q-icon name="upload" class="text-muted" />
          </q-item-section>
          <q-item-section>{{ t('welcome.import_backup.heading') }}</q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </div>

  <setup-instance v-model="setupDialog" />
  <import-backup v-model="importDialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLogo } from '../../composables/Logo'
import ImportBackup from './ImportBackup.vue'
import SetupInstance from '../setup/SetupInstance.vue'
import { useTranslation } from '../../composables/i18n.ts'

const logo = useLogo()
const t = useTranslation()

const setupDialog = ref(false)
const importDialog = ref(false)
</script>
