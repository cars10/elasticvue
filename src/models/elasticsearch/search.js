import { isEmpty } from '../../helpers'

export default class Search {
  q
  from
  size
  index

  constructor (params) {
    this.q = params.q || '*'
    this.from = isEmpty(params.from) ? 0 : parseInt(params.from)
    this.size = isEmpty(params.size) ? 25 : parseInt(params.size)
    this.index = [] || params.index
  }

  evaluate () {
    this.q = isEmpty(this.q) ? '*' : this.q
    this.from = isEmpty(this.from) ? 0 : parseInt(this.from)
    this.size = isEmpty(this.size) ? 25 : parseInt(this.size)
    this.index = isEmpty(this.index) ? [] : this.index
    return this
  }
}
