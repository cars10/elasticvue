<template>
  <p>
    Your cluster uses authorization. Make sure that you have set "http.cors.allow-headers", otherwise you will not be
    able to connect.
  </p>
</template>

<script>
  export default {
    name: 'authorization-header-hint',
    setup () {
      return {}
    }
  }
</script>
