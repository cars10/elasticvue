describe('Indices page', () => {
  beforeEach(() => {
    cy.deleteAllIndices()
    cy.quickConnect()
    cy.visit('/cluster/0/indices')
  })

  describe('managing indices', () => {
    it('can create indices with default options', () => {
      const indexName = 'name-1'
      cy.get('#new_index').click()
      cy.get('#index_name').clear()
      cy.get('#index_name').type(indexName)
      cy.get('#create_index').click()

      cy.flushIndices().then(() => {
        cy.get('table').should('contain', indexName)
      })
    })

    it('can create indices with custom options', () => {
      const indexName = 'name-1'
      const indexShards = '3'
      const indexReplicas = '2'

      cy.get('#new_index').click()
      cy.get('#index_name').clear()
      cy.get('#index_name').type(indexName)

      cy.get('#index_shards').clear()
      cy.get('#index_shards').type(indexShards)

      cy.get('#index_replicas').clear()
      cy.get('#index_replicas').type(indexReplicas)

      cy.get('#create_index').click()

      cy.flushIndices().then(() => {
        cy.reload(true)
        cy.get('table').should(table => {
          expect(table).to.contain(indexName)
          expect(table).to.contain(indexShards)
          expect(table).to.contain(indexReplicas)
        })
      })
    })

    it('can show indices', () => {
      const indexName = 'name-1'
      cy.createIndex(indexName)
      cy.flushIndices().then(() => {
        cy.reload(true)
        cy.get('table').contains(indexName).closest('tr').get('button[title="Options"]').click()
        cy.get('table').contains(indexName).closest('tr').get('div.v-list-item__content').contains('info').click()
        cy.contains('mappings').should('exist')
      })
    })

    it('can show index stats', () => {
      const indexName = 'name-1'
      cy.createIndex(indexName)
      cy.flushIndices().then(() => {
        cy.reload(true)
        cy.get('table').contains(indexName).closest('tr').get('button[title="Options"]').click()
        cy.get('table').contains(indexName).closest('tr').get('div.v-list-item__content').contains('stats').click()
        cy.contains('_shards').should('exist')
      })
    })

    it('can delete indices', () => {
      const indexName = 'name-1'
      cy.createIndex(indexName)
      cy.flushIndices().then(() => {
        cy.reload(true)
        cy.get('table').contains(indexName).closest('tr').get('button[title="Options"]').click()
        cy.get('table').contains(indexName).closest('tr').get('div.v-list-item__content').contains('Delete').click()
        cy.reload(true)
        cy.get('table').should('not.contain', indexName)
      })
    })
  })

  describe('table', () => {
    it('can reload', () => {
      cy.get('table').should('contain', 'No entries found')

      const indexName = 'name-1'
      cy.createIndex(indexName)

      cy.flushIndices().then(() => {
        cy.get('#reload-indices').click()
        cy.get('table').should('contain', indexName)
      })
    })

    it('can filter', () => {
      const indexName = 'name-1'

      cy.createIndex(indexName).then(() => {
        return cy.flushIndices()
      }).then(() => {
        cy.reload(true)
        cy.get('table').should('contain', indexName)

        cy.get('#filter').clear()
        cy.get('#filter').type('name-2')

        cy.get('table').should('not.contain', indexName)

        cy.get('#filter').clear()
        cy.get('#filter').type('name-1')

        cy.get('table').should('contain', 'No entries found')
      })
    })
  })

  describe('aliases', () => {
    it('can create index aliases', () => {
      const indexName = 'name-1'
      const aliasName = `${indexName}-alias`
      createIndexAlias(indexName, aliasName)
      cy.get('div.v-dialog').should('contain', aliasName)
    })

    it('can delete index aliases', () => {
      const indexName = 'name-1'
      const aliasName = `${indexName}-alias`
      createIndexAlias(indexName, aliasName)
      cy.get('div.v-dialog').should('contain', aliasName)
      cy.get('div.v-dialog').get('button').contains('Delete').click()
      cy.get('div.v-dialog').should('not.contain', aliasName)
    })
  })
})

const createIndexAlias = (indexName, aliasName) => {
  cy.createIndex(indexName).then(() => {
    return cy.flushIndices()
  }).then(() => {
    cy.reload(true)
    cy.get('table').contains(indexName).closest('tr').get('button[title="Options"]').click()
    cy.get('table').contains(indexName).closest('tr').get('div.v-list-item__content').contains('Aliases').click()
    cy.get('#new_index_alias_name').clear()
    cy.get('#new_index_alias_name').type(aliasName)
    cy.get('#add_index_alias').click()
  })
}
