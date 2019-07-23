<template>
  <div>
    <h2 class="title mb-1">1. Configure</h2>
    <v-col class="px-4">
      <p class="mb-1">Add the following lines to your <strong>elasticsearch.yml</strong>:</p>

      <!-- @formatter:off -->
<code class="code-block"><span class="code-comment"># allow CORS requests from {{domain}}</span>
http.cors.enabled: true
http.cors.allow-origin: "{{domain}}"

<span class="code-comment"># and if your cluster uses authorization:</span>
http.cors.allow-headers : X-Requested-With,Content-Type,Content-Length,Authorization
</code>
<!-- @formatter:on -->
      <p class="mt-2 mb-0">Then restart your cluster.</p>
    </v-col>
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
