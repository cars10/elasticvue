<template>
  <v-layout>
    <v-flex lg8 offset-lg2>
      <v-card>
        <v-card-title>
          <h1 class="headline">Utilities</h1>
        </v-card-title>
        <v-divider/>

        <v-card-text>
          <v-layout row wrap>
            <v-flex md6>
              <v-subheader>Create</v-subheader>
              <v-divider/>
              <v-list>
                <template v-for="utility in utilities.create">
                  <utility :text="utility.text"
                           :confirm-message="utility.confirmMessage"
                           :method="utility.method"
                           :method-params="utility.methodParams"/>
                </template>
              </v-list>
            </v-flex>

            <v-flex md6>
              <v-subheader>Delete</v-subheader>
              <v-divider/>
              <v-list>
                <template v-for="utility in utilities.delete">
                  <utility :text="utility.text"
                           :confirm-message="utility.confirmMessage"
                           :method="utility.method"
                           :method-params="utility.methodParams"/>
                </template>
              </v-list>
            </v-flex>

            <v-flex md6>
              <v-subheader>Misc</v-subheader>
              <v-divider/>
              <v-list>
                <template v-for="utility in utilities.misc">
                  <utility :text="utility.text"
                           :confirm-message="utility.confirmMessage"
                           :method="utility.method"
                           :method-params="utility.methodParams"/>
                </template>
              </v-list>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import Utility from '@/components/Utilities/Utility'
  import { WORDS } from '../consts'

  export default {
    name: 'Utilities',
    components: {
      Utility
    },
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
    }
  }
</script>
