<template>
  <q-btn flat no-caps size="sm" class="q-px-xs" @click="examplesOpen = !examplesOpen">
    <q-icon :name="examplesOpen ? 'expand_less' : 'expand_more'" />
    {{ t('search.form.search_examples.button') }}
  </q-btn>

  <q-slide-transition>
    <div v-if="examplesOpen" class="q-pt-md">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="t('search.form.search_examples.hint')" />

      <q-markup-table flat>
        <thead>
          <tr>
            <th>Query</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-mon">server error</td>
            <td>Get all documents that contain the words <strong>server</strong> or <strong>error</strong> in any field</td>
          </tr>
          <tr>
            <td class="font-mon">_id:1</td>
            <td>Get all documents where the <strong>_id</strong> field is <strong>1</strong></td>
          </tr>
          <tr>
            <td class="font-mon">full_name:"John Smith"</td>
            <td>
              Get all documents where the <strong>full_name</strong> field is exactly <strong>John
                Smith</strong>, including whitespace
            </td>
          </tr>
          <tr>
            <td class="font-mon">first_name:(John OR Pete)</td>
            <td>
              Get all documents where the <strong>first_name</strong> field is <strong>John</strong> or <strong>Pete</strong>
            </td>
          </tr>
          <tr>
            <td class="font-mon">age:>25</td>
            <td>Get all documents where the <strong>age</strong> field is greater than <strong>25</strong></td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </q-slide-transition>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useTranslation } from '../../composables/i18n.ts'

  const t = useTranslation()
  const examplesOpen = ref(false)
</script>