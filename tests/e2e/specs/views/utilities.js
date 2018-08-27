describe('Utilities page', () => {
  beforeEach(() => {
    cy.cleanupElasticsearch()
    cy.connect()
  })

  describe('creating data', () => {
    it('does create 10 indices', () => {
      cy.visit('/utilities')
      cy.catIndices().then(response => {
        expect(response.body).to.be.empty
      })
      cy.get('#utility_create_createIndices').click()
      cy.get('#utility_create_createIndices').should('not.have.class', 'v-btn v-btn--loader') // wait for all requests
      cy.catIndices().then(response => {
        expect(response.body).not.to.be.empty
      })
    })
  })
})
