<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ $t('query.heading') }}
      </h1>
      <q-btn href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html"
             size="sm"
             class="q-ml-md"
             target="_blank">
        <q-icon dense name="launch" />&nbsp;
        {{ $t('query.api_documentation') }}
      </q-btn>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <rest-query-form />
    </q-card-section>
  </q-card>
</template>

<script setup>
  import RestQueryForm from './RestQueryForm.vue'
</script>
