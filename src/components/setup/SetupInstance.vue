<template>
  <div class="row">
    <div class="col-lg-8 offset-lg-2">
      <q-card>
        <q-card-section>
          <h1 class="text-h5 q-my-none">
            {{ $t('setup.heading') }}
          </h1>
        </q-card-section>

        <q-separator />

        <template v-if="SHOW_CORS_HINT">
          <q-card-section>
            <h2 class="text-h5">
              {{ $t('setup.configure.heading') }}
            </h2>
            <configure-help />
          </q-card-section>

          <q-separator />
        </template>

        <q-card-section>
          <h2 v-if="SHOW_CORS_HINT" class="text-h5 q-mb-md">
            {{ $t('setup.test_and_connect.heading') }}
          </h2>
          <add-instance />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
  import AddInstance from './AddInstance.vue'
  import { SHOW_CORS_HINT } from '../../consts'
  import ConfigureHelp from './ConfigureHelp.vue'
</script>