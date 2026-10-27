<template>
  <div class="font-14">
    <p class="q-mb-sm">{{ t('setup.configure.introduction') }} <strong>elasticsearch.yml</strong>:</p>

    <div class="relative-position">
      <pre class="code-snippet q-ma-none"><span class="text-muted"># {{ t('setup.configure.allow_cors', { domain }) }}</span>
http.cors.enabled: true
http.cors.allow-origin: "{{ domain }}"

<span class="text-muted"># {{ t('setup.configure.authorization') }}:</span>
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization</pre>
      <copy-button :value="copyValue" flat round dense size="sm" class="absolute-top-right q-ma-xs text-muted" />
    </div>

    <p class="text-muted q-mt-sm q-mb-none">{{ t('setup.configure.restart') }}.</p>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n'
import CopyButton from '../shared/CopyButton.vue'

const domain = window.location.origin
const copyValue = `http.cors.enabled: true\nhttp.cors.allow-origin: "${domain}"\nhttp.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization`

const t = useTranslation()
</script>
