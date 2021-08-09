<template>
  <p>
    {{ $t('shared.ssl_hint.hint') }}
    <a aria-label="SSL Configuration help"
       href="https://github.com/cars10/elasticvue/wiki/Access-clusters-using-SSL"
       rel="nofollow"
       target="_blank">
      {{ $t('shared.ssl_hint.help') }}
    </a>
  </p>
</template>

<script>
  export default {
    name: 'ssl-hint',
    setup () {
      return {}
    }
  }
</script>
