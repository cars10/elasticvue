<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Utilities</h1>
    </v-card-title>
    <v-divider></v-divider>

    <v-card-text>
      <v-layout row wrap>
        <v-flex md6>
          <v-subheader>Create</v-subheader>
          <v-list>
            <template v-for="utility in utilities.create">
              <v-divider></v-divider>
              <utility :text="utility.text"
                       :confirmMessage="utility.confirmMessage"
                       :method="utility.method"
                       :methodParams="utility.methodParams"></utility>
            </template>
          </v-list>
        </v-flex>

        <v-flex md6>
          <v-subheader>Delete</v-subheader>
          <v-list>
            <template v-for="utility in utilities.delete">
              <v-divider></v-divider>
              <utility :text="utility.text"
                       :confirmMessage="utility.confirmMessage"
                       :method="utility.method"
                       :methodParams="utility.methodParams"></utility>
            </template>
          </v-list>
        </v-flex>

        <v-flex md6>
          <v-subheader>Misc</v-subheader>
          <v-list>
            <template v-for="utility in utilities.misc">
              <v-divider></v-divider>
              <utility :text="utility.text"
                       :confirmMessage="utility.confirmMessage"
                       :method="utility.method"
                       :methodParams="utility.methodParams"></utility>
            </template>
          </v-list>
        </v-flex>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
  import Utility from '@/components/Utilities/Utility'
  import { WORDS } from '../consts'

  export default {
    name: 'Utilities',
    data () {
      return {
        utilities: {
          create: [
            {
              text: 'Create 10 random indices',
              method: 'createIndices',
              methodParams: () => this.getRandomWords(10)
            }
          ],
          delete: [
            {
              text: 'Delete all indices',
              confirmMessage: 'Are you sure? This will delete ALL data in your cluster!',
              method: 'indicesDelete',
              methodParams: {index: '_all'}
            }
          ],
          misc: [
            {
              text: 'Flush all indices to disk',
              method: 'indicesFlush',
              methodParams: {index: '_all'}
            },
            {
              text: 'Set all indices to writable',
              method: 'indicesPutSettings',
              methodParams: {
                index: '_all', body: {'index': {'blocks': {'read_only_allow_delete': 'false'}}}
              }
            }
          ]
        }
      }
    },
    methods: {
      getRandomWords (amount) {
        return [...Array(amount)].map(() => {
          return WORDS[Math.floor(Math.random() * WORDS.length)]
        })
      }
    },
    components: {
      Utility
    }
  }
</script>
