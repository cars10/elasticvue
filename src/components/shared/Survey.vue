<template>
  <v-row v-if="hintVisible">
    <v-col lg="6" offset-lg="3">
      <v-alert color="blue" border="left" dismissible v-model="hintVisible">
        <p>
          <v-icon>mdi-file-document-outline</v-icon>
          <strong class="pl-1">Elasticvue Survey</strong>
        </p>
        <p>You can help me improve elasticvue by answering a survey with 8 short questions:</p>
        <v-btn href="https://elasticvue.com/survey" exact target="_blank" class="mr-2">Open Survey</v-btn>
        <v-btn text @click="hintVisible = false">Hide</v-btn>
      </v-alert>
    </v-col>
  </v-row>
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
