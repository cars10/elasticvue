<template>
  <p>
    Your cluster uses ssl. Make sure that your browser trusts the certificate that you are using, otherwise you
    will not be able to connect.
    <a aria-label="SSL Configuration help" href="https://github.com/cars10/elasticvue/wiki/Access-clusters-using-SSL"
       rel="nofollow"
       target="_blank">Help</a>
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
