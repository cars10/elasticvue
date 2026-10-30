<template>
  <q-card>
    <div class="row no-wrap items-center">
      <q-tabs
        v-model="restStore.activeTabIndex"
        dense
        no-caps
        align="left"
        outside-arrows
        class="col-shrink"
        style="min-width: 0"
      >
        <q-tab v-for="(tab, index) in restStore.tabs" :key="tab.id" :name="index" class="q-pr-xs" data-testid="rest-tab">
          <div class="row no-wrap items-center">
            <span class="ellipsis">{{ tab.label }}</span>

            <q-btn
              v-if="index === restStore.activeTabIndex"
              icon="edit"
              flat
              round
              dense
              size="xs"
              class="q-ml-xs"
              :title="t('query.tabs.rename')"
              data-testid="rest-tab-rename"
              @click.stop
            >
              <rest-query-name-prompt :initial-name="tab.label" @save="(label: string) => restStore.renameTab(tab, label)" />
            </q-btn>

            <q-btn
              v-if="restStore.tabs.length > 1"
              icon="close"
              flat
              round
              dense
              size="xs"
              :title="t('query.tabs.close')"
              data-testid="rest-tab-close"
              @click.stop="restStore.removeTab(index)"
            />
          </div>
        </q-tab>
      </q-tabs>

      <q-btn
        icon="add"
        flat
        round
        dense
        class="q-mx-sm"
        data-testid="rest-tab-add"
        :title="t('query.tabs.new')"
        @click="restStore.addTab()"
      />
    </div>

    <q-separator />

    <q-tab-panels v-model="restStore.activeTabIndex">
      <q-tab-panel v-for="(tab, index) in restStore.tabs" :key="tab.id" :name="index">
        <rest-query-form :tab-id="tab.id!" />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script setup lang="ts">
import RestQueryForm from './RestQueryForm.vue'
import RestQueryNamePrompt from './RestQueryNamePrompt.vue'
import { useRestStore } from '../../store/rest.ts'
import { useTranslation } from '../../composables/i18n.ts'

const t = useTranslation()
const restStore = useRestStore()
</script>
