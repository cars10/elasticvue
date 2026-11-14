<template>
  <div>
    <q-tabs v-model="tab" dense no-caps inline-label align="left" active-color="primary" class="text-muted">
      <q-tab v-for="(_, name) in snippets" :key="name" :name="name" :label="name" />
    </q-tabs>

    <div class="relative-position">
      <pre class="code-snippet q-ma-none">{{ snippets[tab] }}</pre>
      <copy-button :value="snippets[tab]" flat round dense size="sm" class="absolute-top-right q-ma-xs text-muted" />
    </div>

    <div class="text-muted q-mt-sm">{{ t('setup.configure.restart') }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTranslation } from '../../composables/i18n'
import CopyButton from '../shared/CopyButton.vue'

const domain = window.location.origin
const headers = 'X-Requested-With,Content-Type,Content-Length,Authorization'

const snippets: Record<string, string> = {
  'elasticsearch.yml': `http.cors.enabled: true
http.cors.allow-origin: "${domain}"
http.cors.allow-headers: ${headers}`,
  'docker run': `docker run \\
  -e http.cors.enabled=true \\
  -e http.cors.allow-origin="${domain}" \\
  -e http.cors.allow-headers="${headers}" \\
  docker.elastic.co/elasticsearch/elasticsearch:<version>`,
  'compose.yml': `services:
  elasticsearch:
    environment:
      http.cors.enabled: "true"
      http.cors.allow-origin: "${domain}"
      http.cors.allow-headers: "${headers}"`
}

const tab = ref('elasticsearch.yml')
const t = useTranslation()
</script>
