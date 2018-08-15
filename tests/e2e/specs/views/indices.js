describe('Indices Page', () => {
  beforeEach(() => {
    cy.connect()
    cy.cleanupElasticsearch()
  })

  describe('managing indices', () => {
    it('can create indices', () => {
      const indexName = 'name-1'
      cy.createIndex(indexName)
      cy.get('table').should(table => {
        expect(table).to.contain(indexName)
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
})
