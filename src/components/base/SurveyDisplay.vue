<template>
  <div v-if="!store.hidden" class="row q-mb-md">
    <div class="col-md-4 offset-md-4">
      <q-card class="bg-primary-dark text-white">
        <q-card-section class="flex justify-between">
          <h2 class="text-h6 q-my-none">
            2024 Survey
          </h2>
          <q-btn icon="close" flat round dense @click="store.hidden = true" />
        </q-card-section>

        <q-card-section>
          <p>
            You can help me improve elasticvue by answering a short survey:
          </p>
          <q-btn href="https://elasticvue.com/survey" target="_blank" class="bg-positive q-mr-md">
            Open Survey
          </q-btn>
          <small>You can also use the "Survey" link in the footer.</small>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSurveyStore } from '../../store/survey.ts'

  const store = useSurveyStore()
</script>