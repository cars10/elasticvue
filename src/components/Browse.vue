<template>
  <content-or-connect>
    <browse-card :executeSearch="executeSearch"></browse-card>
  </content-or-connect>
</template>

<script>
  import BrowseCard from '@/components/Browse/BrowseCard'

  export default {
    props: {
      executeSearch: {
        default: false
      }
    },
    components: {
      BrowseCard
    }
  }
</script>
