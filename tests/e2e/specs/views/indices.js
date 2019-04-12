describe('Indices page', () => {
  beforeEach(() => {
    cy.cleanupElasticsearch()
    cy.quickConnect()
    cy.visit('/indices')
  })

  describe('managing indices', () => {
    it('can create indices', () => {
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
      cy.visit('/indices')

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
