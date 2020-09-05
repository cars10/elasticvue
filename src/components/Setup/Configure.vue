<template>
  <div>
    <div class="px-4">
      <p class="mb-1">
        You have to setup CORS to use elasticvue. Add the following lines to your <strong>elasticsearch.yml</strong>:
      </p>

      <pre>
<code class="code-block mb-2 whitespace-pre-wrap grey lighten-4"><span class="code-comment"># allow CORS requests from {{
    domain
  }}</span>
http.cors.enabled: true
http.cors.allow-origin: "{{ domain }}"

<span class="code-comment"># and if your cluster uses authorization:</span>
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
</code>
</pre>
      <p class="mb-2 mb-0">Then restart your cluster.</p>
      <p>
        This can also be done if you run elasticsearch via docker, by adding the config via environment variables: <br>
        <code class="grey lighten-4 d-inline-block">docker run -e "http.cors.enabled=true" -e
          "http.cors.allow-origin={{ domain }}" -p 9200:9200
          elasticsearch</code>
      </p>
    </div>
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
