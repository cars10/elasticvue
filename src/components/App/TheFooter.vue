<template>
  <v-footer class="pa-4">
    <v-row>
      <v-col cols="4">
        <change-theme/>
      </v-col>

      <v-col class="text-center" cols="4">
        <div class="text-subtitle-1">
          Elasticvue {{ version }} |
          <a href="https://github.com/cars10/elasticvue/blob/master/CHANGELOG.md" rel="nofollow" target="_blank">
            {{ $t('app-footer.changelog') }}</a>
        </div>
        &copy;{{ new Date().getFullYear() }} - Carsten K&ouml;nig<br>
      </v-col>

      <v-col cols="4">
        <div class="text-right">
          <a href="https://github.com/cars10/elasticvue" rel="nofollow" target="_blank">Github</a><br>
          <a href="https://elasticvue.com" rel="nofollow" target="_blank">{{ $t('app-footer.homepage') }}</a>
        </div>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script>
  import ChangeTheme from '@/components/shared/ChangeTheme'

  export default {
    name: 'app-footer',
    components: {
      ChangeTheme
    },
    setup () {
      return {
        /* eslint-disable no-undef */
        version: VERSION
      }
    }
  }
</script>
