<template>
  <q-header class="bg-warning text-black">
    <div class="row items-center justify-center q-gutter-x-sm q-px-md" style="min-height: 38px" data-testid="beta-banner">
      <span class="row items-center no-wrap q-gutter-x-sm">
        <q-icon name="science" size="20px" />
        <span>{{ t('base.beta_banner.text') }}</span>
      </span>
      <q-btn
        no-caps
        padding="2px 10px"
        color="dark-grey"
        :label="t('base.beta_banner.blog')"
        :href="BLOG_URL"
        target="_blank"
        rel="nofollow"
      />
      <q-btn
        no-caps
        padding="2px 10px"
        color="dark-grey"
        :label="t('base.beta_banner.discussion')"
        :href="DISCUSSION_URL"
        target="_blank"
        rel="nofollow"
      />
    </div>
  </q-header>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n.ts'

const BLOG_URL = 'https://elasticvue.com/blog/elasticvue-2-whats-next/'
const DISCUSSION_URL = 'https://github.com/cars10/elasticvue/issues/364'

const t = useTranslation()
</script>
