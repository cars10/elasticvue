<template>
  <div>
    <p class="q-mb-sm">
      {{ $t('setup.configure.introduction') }} <strong>elasticsearch.yml</strong>:
    </p>

    <pre>
<code class="code-block whitespace-pre-wrap bg-grey-2"><span
    class="code-comment"># {{ $t('setup.configure.allow_cors', { domain }) }}</span>
http.cors.enabled: true
http.cors.allow-origin: "{{ domain }}"

<span class="code-comment"># {{ $t('setup.configure.authorization') }}:</span>
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
</code>
</pre>
    <p>{{ $t('setup.configure.restart') }}.</p>
    <p>
      {{ $t('setup.configure.docker') }}: <br>
      <code class="bg-grey-2 inline-block">docker run -e "http.cors.enabled=true" -e
        "http.cors.allow-origin={{ domain }}" -p 9200:9200
        elasticsearch</code>
    </p>
  </div>
</template>

<script setup>
  const domain = window.location.origin
</script>
