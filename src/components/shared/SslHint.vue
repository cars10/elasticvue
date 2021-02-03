<template>
  <p>
    Your cluster uses ssl. Make sure that your browser trusts the certificate that you are using, otherwise you
    will not be able to connect.
    <a href="https://github.com/cars10/elasticvue/wiki/Access-clusters-using-SSL" target="_blank" rel="nofollow"
       aria-label="SSL Configuration help">Help</a>
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
