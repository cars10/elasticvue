<template>
  <div>
    <div class="px-4">
      <p class="mb-1">You have to setup CORS to use elasticvue. Add the following lines to your <strong>elasticsearch.yml</strong>:</p>

      <!-- @formatter:off -->
<code class="code-block mb-2"><span class="code-comment"># allow CORS requests from {{domain}}</span>
http.cors.enabled: true
http.cors.allow-origin: "{{domain}}"

<span class="code-comment"># and if your cluster uses authorization:</span>
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
</code>
<!-- @formatter:on -->
      <p class="mb-2 mb-0">Then restart your cluster.</p>
      <p>
        This can also be done if you run elasticsearch via docker, by adding the config via environment variables: <br>
        <!-- @formatter:off -->
        <code>docker run -e "http.cors.enabled=true" -e "http.cors.allow-origin={{domain}}" -p 9200:9200 elasticsearch</code>
<!-- @formatter:on -->
      </p>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'configure',
    computed: {
      domain () {
        return window.location.origin
      }
    }
  }
</script>
