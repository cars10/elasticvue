<template>
  <v-expand-transition>
    <v-row v-if="hintVisible">
      <v-col lg="6" offset-lg="3">
        <v-alert color="blue" border="left" dismissible v-model="hintVisible">
          <p>
            <v-icon>mdi-file-document-outline</v-icon>
            <strong class="pl-1">Elasticvue Survey</strong>
          </p>
          <p>
            You can help me improve elasticvue by answering a short survey:
          </p>
          <v-btn href="https://elasticvue.com/survey" exact target="_blank" class="mr-2"
                 title="Open survey on google forms">
            <v-icon small class="mr-2">mdi-open-in-new</v-icon>
            Open Survey
          </v-btn>
          <v-btn text @click="hintVisible = false">Hide</v-btn>
          <p class="mb-0 mt-2">
            <small>You can also use the "Survey" link in the footer.</small>
          </p>
        </v-alert>
      </v-col>
    </v-row>
  </v-expand-transition>
</template>

<script>
  import { compositionVuexAccessors } from '@/helpers/store'

  export default {
    name: 'survey',
    setup () {
      const { hintVisible } = compositionVuexAccessors('survey', ['hintVisible'])

      return {
        hintVisible
      }
    }
  }
</script>
