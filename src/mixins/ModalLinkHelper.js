import ModalDataLoader from '@/components/shared/ModalDataLoader'
import ListTileModalLink from '@/components/shared/ListTile/ListTileModalLink'

const ModalLinkHelper = {
  components: {
    ModalDataLoader,
    ListTileModalLink
  },
  data () {
    return {
      modalOpen: false,
      modalTitle: '',
      modalMethod: '',
      modalSubtitle: '',
      modalMethodParams: {}
    }
  },
  methods: {
    linkRoute (routeName, params) {
      return { name: routeName, params: params }
    },
    openModal (subtitle, method, params) {
      this.modalTitle = method
      this.modalSubtitle = subtitle
      this.modalMethod = method
      this.modalMethodParams = params
      this.modalOpen = true
    }
  }
}

export default ModalLinkHelper
