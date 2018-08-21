describe('Indices Page', () => {
  beforeEach(() => {
    cy.cleanupElasticsearch()
    cy.connect()
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
      cy.get('table').contains(indexName).closest('tr').get('button[title="Show"]').click()
      cy.location().should(location => {
        expect(location.pathname).to.match(/\/indices\/[a-z0-9]*/)
      })
      cy.contains(indexName)
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
