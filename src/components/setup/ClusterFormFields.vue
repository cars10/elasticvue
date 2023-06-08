<template>
  <div class="q-mb-md">
    <div class="q-mb-md">
      <q-input v-model="cluster.name"
               required
               label="Cluster name"
               autocomplete="off"
               outlined
               autofocus />
    </div>

    <div class="row q-mb-md">
      <div class="col-md-6 col-12 q-pr-sm">
        <q-input v-model="cluster.username"
                 outlined
                 :label="$t('setup.test_and_connect.form.username.label')"
                 autocomplete="off" />
      </div>

      <div class="col-md-6 col-12 q-pl-sm">
        <q-input v-model="cluster.password"
                 autocomplete="off"
                 outlined
                 :label="$t('setup.test_and_connect.form.password.label')"
                 :type="passwordVisible ? 'text' : 'password'">
          <template #append>
            <q-icon :name="passwordVisible ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="passwordVisible = !passwordVisible" />
          </template>
        </q-input>
      </div>
    </div>

    <q-input v-model="cluster.uri"
             :rules="[validateUri]"
             required
             outlined
             :label="$t('setup.test_and_connect.form.uri.label')">
      <template #append>
        <q-icon name="close" class="cursor-pointer" @click="cluster.uri = DEFAULT_CLUSTER_URI" />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { DEFAULT_CLUSTER_URI } from '../../consts'

  const props = defineProps<{ modelValue: object, formValid: boolean }>()
  const cluster = ref(props.modelValue)
  const passwordVisible = ref(false)

  const validateUri = uri => {
    try {
      new URL(uri)
      if (/^https?:\/\/.*/.test(uri)) {
        emit('update:formValid', true)
        return true
      }
    } catch (e) {
      emit('update:formValid', false)
      return 'Invalid uri'
    }
  }

  const emit = defineEmits(['update:modelValue', 'update:formValid'])
  watch(cluster, value => emit('update:modelValue', value))
</script>