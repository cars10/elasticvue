<template>
  <tr>
    <td>{{ snapshot.id }}</td>
    <td>{{ snapshot.status }}</td>
    <td>{{ snapshot.start_time }} ({{ snapshot.start_epoch }})</td>
    <td>{{ snapshot.end_time }} ({{ snapshot.end_epoch }})</td>
    <td>{{ snapshot.duration }}</td>
    <td>
      {{ snapshot.indices }}
      <v-btn v-if="indexNamesLoaded" text @click="loadIndexNames">
        <v-icon>mdi-chevron-up</v-icon>
        {{ $t('snapshots.snapshot.indices.hide') }}
      </v-btn>
      <v-btn v-else text @click="loadIndexNames">
        <v-icon>mdi-chevron-down</v-icon>
        {{ $t('snapshots.snapshot.indices.show') }}
      </v-btn>
      <ul v-if="indexNames">
        <li v-for="name in indexNames" :key="name">{{ name }}</li>
      </ul>
    </td>
    <td>{{ snapshot.successful_shards }}</td>
    <td>{{ snapshot.failed_shards }}</td>
    <td>{{ snapshot.total_shards }}</td>
    <td>
      <btn-group small>
        <v-menu left offset-y>
          <template v-slot:activator="{on}">
            <v-btn v-on="on" :title="$t('snapshots.snapshot.options')">
              <v-icon>mdi-cog</v-icon>
              <v-icon small>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <restore-snapshot :repository="repository" :snapshot="snapshot.id"/>

            <list-tile-link :callback="emitReloadData"
                            :confirm-message="$t('snapshots.snapshot.delete.confirm', {snapshot: snapshot.id})"
                            :growl="$t('snapshots.snapshot.delete.growl', {snapshot: snapshot.id})"
                            :link-title="$t('snapshots.snapshot.delete.text')"
                            :method-params="{repository, snapshot: snapshot.id}" icon="mdi-delete"
                            method="snapshotDelete"/>
          </v-list>
        </v-menu>
      </btn-group>
    </td>
  </tr>
</template>

<script>
  import RestoreSnapshot from '@/components/Snapshots/RestoreSnapshot'
  import BtnGroup from '@/components/shared/BtnGroup'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import { ref } from 'vue'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'

  export default {
    name: 'snapshot',
    components: {
      BtnGroup,
      ListTileLink,
      RestoreSnapshot
    },
    props: {
      snapshot: {
        type: Object,
        default: () => ({})
      },
      repository: {
        type: String,
        default: ''
      }
    },
    setup (props, context) {
      const indexNamesLoaded = ref(false)
      const indexNames = ref([])

      const { callElasticsearch } = useElasticsearchRequest()
      const loadIndexNames = item => {
        if (indexNamesLoaded.value) {
          indexNamesLoaded.value = false
          indexNames.value = []
        } else {
          callElasticsearch('getSnapshot', { repository: props.repository, snapshot: props.snapshot.id })
            .then(body => {
              indexNamesLoaded.value = true
              indexNames.value = body.snapshots[0].indices
            })
        }
      }

      const emitReloadData = () => {
        context.emit('reloadData')
      }

      return {
        indexNamesLoaded,
        indexNames,
        emitReloadData,
        loadIndexNames
      }
    }
  }
</script>
