describe('Indices page', () => {
  beforeEach(() => {
    cy.cleanupElasticsearch()
    cy.quickConnect()
  })

  describe('managing indices', () => {
    it('can create indices', () => {
      const indexName = 'name-1'
      cy.createIndex(indexName)
      cy.get('table').should(table => {
        expect(table).to.contain(indexName)
      })
    })

    it('can show indices', () => {
      const indexName = 'name-1'
      cy.createIndex(indexName)
      cy.flushIndices().then(() => {
        cy.get('table').contains(indexName).closest('tr').get('a[title="Show index"]').click()
        cy.contains('mappings').should('exist')
      })
    })

    it('can delete indices', () => {
      const indexName = 'name-1'
      cy.createIndex(indexName)
      cy.get('table').contains(indexName).closest('tr').get('button[title="Delete"]').click()
      cy.get('table').should(table => {
        expect(table).not.to.contain(indexName)
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
      cy.request('PUT', 'http://localhost:' + Cypress.env('ES_PORT').toString() + '/' + indexName)
      cy.get('#reload-indices').click()

      cy.get('table').should(table => {
        expect(table).to.contain(indexName)
      })
    })

    it('can filter', () => {
      const indexName = 'name-1'
      cy.createIndex(indexName)
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
