import { useTranslation } from '../../i18n'
import { useSnackbar } from '../../Snackbar'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { Ref, ref, watch } from 'vue'
import { askConfirm } from '../../../helpers/dialogs'
import { genColumns } from '../../../helpers/tableColumns'

type Alias = {
  alias: string
}

export type IndexAliasProps = {
  index: string
}

export const useIndexAliases = (props: IndexAliasProps, emit: any) => {
  const t = useTranslation()
  const { showSnackbar } = useSnackbar()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  const dialog = ref(false)
  const newAlias = ref('')
  const aliases: Ref<Alias[]> = ref([])

  watch(dialog, (value) => {
    if (value) {
      loadAliases()
    } else {
      emit('reload')
    }
  })

  const loadAliases = () => {
    callElasticsearch('indexGetAlias', { index: props.index })
      .then((body) => {
        aliases.value = Object.keys(body[props.index].aliases).map((alias) => ({ alias }))
      })
      .catch(() => (aliases.value = []))
  }

  const addAlias = () => {
    callElasticsearch('indexAddAlias', { index: props.index, alias: newAlias.value })
      .then(() => {
        loadAliases()
        newAlias.value = ''
      })
      .catch(() => {
        console.log(requestState.value)
        showSnackbar(requestState.value)
      })
  }

  const deleteAlias = (alias: string) => {
    askConfirm(t('indices.index_aliases.delete_alias.confirm', { alias, index: props.index })).then((confirmed) => {
      if (confirmed) {
        callElasticsearch('indexDeleteAlias', { index: props.index, alias })
          .then(loadAliases)
          .catch(() => showSnackbar(requestState.value))
      }
    })
  }

  const columns = genColumns([{ label: t('indices.index_aliases.table.headers.alias'), field: 'alias' }, { label: '' }])

  return {
    dialog,
    requestState,
    newAlias,
    aliases,
    loadAliases,
    addAlias,
    deleteAlias,
    columns
  }
}
