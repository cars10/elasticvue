describe('Utilities page', () => {
  beforeEach(() => {
    cy.cleanupElasticsearch()
    cy.quickConnect()
    cy.visit('/utilities')
  })

  describe('creating data', () => {
    it('creates 10 indices', () => {
      cy.get('#utility_create_createIndices').click()
      cy.get('#utility_create_createIndices', { timeout: 10000 }).should('not.have.class', 'v-btn v-btn--loader') // wait for all requests
      cy.wait(250)
      cy.flushIndices().then(() => {
        cy.wait(250)
        cy.catIndices().then(response => {
          expect(response.body).not.to.be.empty
          expect(response.body).to.have.lengthOf(10)
        })
      })
    })

    it('creates twitter index and tweets', () => {
      cy.get('#utility_create_bulk').click()
      cy.get('#utility_create_bulk', { timeout: 1000 }).should('not.have.class', 'v-btn v-btn--loader')
      cy.wait(250)
      cy.flushIndices().then(() => {
        cy.catIndices().then(response => {
          expect(response.body).not.to.be.empty
          expect(response.body).to.have.lengthOf(1)
          expect(response.body[0]['docs.count']).to.equal('100')
        })
      })
    })
  })

  describe('deleting data', () => {
    it('deletes all indices', () => {
      cy.createIndex('some-index')
      cy.flushIndices().then(() => {
        cy.get('#utility_delete_indicesDelete').click()
        cy.get('#utility_delete_indicesDelete', { timeout: 1000 }).should('not.have.class', 'v-btn v-btn--loader')
        cy.wait(250)
        cy.catIndices().then(response => {
          expect(response.body).to.be.empty
          expect(response.body).to.have.lengthOf(0)
        })
      })
    })
  })
})
