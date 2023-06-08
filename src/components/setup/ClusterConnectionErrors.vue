<template>
  <q-banner class="text-white bg-negative q-mt-lg q-py-md">
    <template #avatar>
      <q-icon name="error" />
    </template>
    {{ $t('setup.test_and_connect.error.heading') }}
    <ol class="q-pl-lg q-my-sm">
      <li>
        {{ $t('setup.test_and_connect.error.cluster_reachable') }}
        <a :href="uri" target="_blank">{{ uri }}</a>
      </li>
      <li>
        {{ $t('setup.test_and_connect.error.correct_settings') }} <strong>elasticsearch.yml</strong>
        {{ $t('setup.test_and_connect.error.cluster_restarted') }}
      </li>
    </ol>

    <div class="q-mt-sm">
      {{ errorMessage }}
    </div>
  </q-banner>
</template>

<script setup lang="ts">
  defineProps<{ uri: string, errorMessage: string }>()
</script>