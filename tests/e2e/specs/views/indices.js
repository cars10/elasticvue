describe('Indices page', () => {
  beforeEach(() => {
    cy.cleanupElasticsearch()
    cy.quickConnect()
    cy.visit('/indices')
  })

  describe('managing indices', () => {
    it('can create indices with default options', () => {
      const indexName = 'name-1'
      cy.get('#new_index').click()
      cy.get('#index_name').clear()
      cy.get('#index_name').type(indexName)
      cy.get('#create_index').click()

      cy.flushIndices().then(() => {
        cy.reload(true)
        cy.get('table').should(table => {
          expect(table).to.contain(indexName)
        })
      })
    })

    it('can create indices with changed options', () => {
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
        cy.get('table').contains(indexName).closest('tr').get('a').contains('info').click()
        cy.contains('mappings').should('exist')
      })
    })

    it('can show index stats', () => {
      const indexName = 'name-1'
      cy.createIndex(indexName)
      cy.flushIndices().then(() => {
        cy.reload(true)
        cy.get('table').contains(indexName).closest('tr').get('button[title="Options"]').click()
        cy.get('table').contains(indexName).closest('tr').get('a').contains('stats').click()
        cy.contains('_shards').should('exist')
      })
    })

    it('can delete indices', () => {
      const indexName = 'name-1'
      cy.createIndex(indexName)
      cy.flushIndices().then(() => {
        cy.reload(true)
        cy.get('table').contains(indexName).closest('tr').get('button[title="Options"]').click()
        cy.get('table').contains(indexName).closest('tr').get('a').contains('Delete').click()
        cy.get('table').should(table => {
          expect(table).not.to.contain(indexName)
        })
      })
    })
  })

  describe('table', () => {
    it('can reload', () => {
      cy.get('table').should(table => {
        expect(table).to.contain('No data available')
      })

      const indexName = 'name-1'
      cy.createIndex(indexName)

      cy.flushIndices().then(() => {
        cy.get('#reload-indices').click()

        cy.get('table').should(table => {
          expect(table).to.contain(indexName)
        })
      })
    })

    it('can filter', () => {
      const indexName = 'name-1'

      cy.createIndex(indexName).then(() => {
        return cy.flushIndices()
      }).then(() => {
        cy.reload(true)
        cy.get('table').should(table => {
          expect(table).to.contain(indexName)
        })

        cy.get('#filter').clear()
        cy.get('#filter').type('name-2')

        cy.get('table').should(table => {
          expect(table).not.to.contain(indexName)
        })

        cy.get('#filter').clear()
        cy.get('#filter').type('name-1')

        cy.get('table').should(table => {
          expect(table).to.contain(indexName)
        })
      })
    })
  })
})
