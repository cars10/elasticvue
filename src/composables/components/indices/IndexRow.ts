import { useTemplateRef } from 'vue'
import { useModal } from '../../Modal'
import { QMenu } from 'quasar'
import { useRouter } from 'vue-router'
import ElasticsearchIndex from '../../../models/ElasticsearchIndex.ts'

export type IndexRowProps = {
  index: ElasticsearchIndex
}

export const useIndexRow = (_props: IndexRowProps, emit: any) => {
  const menu = useTemplateRef<QMenu>('menu')

  const { openModalWith } = useModal()

  const emitReloadAndCloseMenu = () => {
    emit('reload')
    menu.value?.hide()
  }

  const router = useRouter()
  const showDocuments = (index: string) => router.push({ name: 'search', query: { index } })

  return {
    menu,
    openModalWith,
    emitReloadAndCloseMenu,
    showDocuments
  }
}
