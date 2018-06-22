<template>
  <div>
    <h2 class="title mb-1">1. Configure</h2>
    <v-flex px-3>
      <p class="mb-1">Add the following lines to your <strong>elasticsearch.yml</strong>:</p>

      <!-- @formatter:off -->
<code class="code-block"><span class="code-comment"># allow CORS requests from {{domain}}</span>
http.cors.enabled: true
http.cors.allow-origin: "{{domain}}"

<span class="code-comment"># Alternatively you can pass a regex to allow all relevant origins:</span>
<span class="code-comment" style="display: block"># /(https?:\/\/localhost(:[0-9]+)?)|(chrome-extension:\/\/[a-z]+)|(https?:\/\/app.elasticvue.com)/</span></code>
<!-- @formatter:on -->
    </v-flex>
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
