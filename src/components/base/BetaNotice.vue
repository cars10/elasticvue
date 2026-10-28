<template>
  <div v-if="!dismissed" class="row q-mb-md">
    <q-banner rounded inline-actions class="col-12 col-lg-8 offset-lg-2 bg-primary-dark text-white" data-testid="beta-notice">
      <template #avatar>
        <q-icon name="campaign" />
      </template>
      {{ t('base.beta_notice.text') }}
      <template #action>
        <q-btn
          unelevated
          no-caps
          color="white"
          text-color="primary"
          :label="t('base.beta_notice.try')"
          :href="BETA_URL"
          target="_blank"
        />
        <q-btn outline no-caps :label="t('base.beta_notice.blog')" :href="BLOG_URL" target="_blank" class="q-ml-sm" />
        <q-btn flat round dense icon="close" :title="t('base.beta_notice.dismiss')" class="q-ml-sm" @click="dismiss" />
      </template>
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'

const STORAGE_KEY = 'elasticvue2BetaNoticeDismissed'
const BLOG_URL = 'https://elasticvue.com/blog/elasticvue-2-whats-next/'
const BETA_URL = 'https://beta.elasticvue.com'

const t = useTranslation()
const dismissed = ref(localStorage.getItem(STORAGE_KEY) === 'true')

const dismiss = () => {
  dismissed.value = true
  localStorage.setItem(STORAGE_KEY, 'true')
}
</script>
