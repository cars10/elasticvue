<template>
  <div>
    <p class="q-mb-sm">
      {{ t('setup.configure.introduction') }} <strong>elasticsearch.yml</strong>:
    </p>

    <pre>
<code class="code-block whitespace-pre-wrap bg-grey-3"><span
    class="code-comment"># {{ t('setup.configure.allow_cors', { domain }) }}</span>
http.cors.enabled: true
http.cors.allow-origin: "{{ domain }}"

<span class="code-comment"># {{ t('setup.configure.authorization') }}:</span>
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
</code>
</pre>
    <p>{{ t('setup.configure.restart') }}.</p>
  </div>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/i18n'

  const domain = window.location.origin
  const t = useTranslation()
</script>
