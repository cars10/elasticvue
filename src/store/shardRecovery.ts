import { defineStore } from 'pinia'

type ShardRecoveryState = {
  filter: string,
  stickyTableHeader: boolean,
  pagination: any,
}

export const useShardRecoveryState = defineStore('shardRecovery', {
  state: (): ShardRecoveryState => ({
    filter: '',
    stickyTableHeader: false,
    pagination: {
      sortBy: 'name',
      descending: false,
      rowsPerPage: 10
    },
  }),
  persist: {
    pick: [
      'filter',
      'stickyTableHeader',
      'pagination.sortBy',
      'pagination.descending',
      'pagination.rowsPerPage',
    ]
  }
})
