<template>
  <div>
    <p class="mb-1">
      {{ $t('setup.configure-info-1', { app: 'Elasticvue' }) }} <strong>elasticsearch.yml</strong>:
    </p>

    <pre>
<code class="code-block mb-2 whitespace-pre-wrap grey lighten-4"><span
  class="code-comment"># {{ $t('setup.configure-info-2') }} {{
    domain
  }}</span>
http.cors.enabled: true
http.cors.allow-origin: "{{ domain }}"

<span class="code-comment"># {{ $t('setup.configure-info-3') }}:</span>
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
</code>
</pre>
    <p class="mb-2 mb-0">{{ $t('setup.configure-info-4') }}.</p>
    <p>
      {{ $t('setup.configure-info-5') }}: <br>
      <code class="grey lighten-4 d-inline-block">docker run -e "http.cors.enabled=true" -e
        "http.cors.allow-origin={{ domain }}" -p 9200:9200
        elasticsearch</code>
    </p>
  </div>
</template>

<script>
  export default {
    name: 'configure',
    setup () {
      return {
        domain: window.location.origin
      }
    }
  }
</script>
