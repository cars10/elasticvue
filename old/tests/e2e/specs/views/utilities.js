describe('Utilities page', () => {
  beforeEach(() => {
    cy.deleteAllIndices()
    cy.quickConnect()
    cy.visit('/cluster/0/utilities')
  })

  describe('creating data', () => {
    it('creates twitter index and tweets', () => {
      cy.get('#utility_create_bulk').click()
      cy.get('#utility_create_bulk', { timeout: 1000 }).should('not.have.class', 'v-btn v-btn--loader')
      cy.wait(250)
      cy.flushIndices().then(() => {
        cy.getIndex('twitter').then(response => {
          expect(response.status).to.equal(200)
          expect(response.body).not.to.be.empty
        })
      })
    })
  })

  describe('deleting data', () => {
    it('deletes all indices', () => {
      cy.createIndex('some-index')
      cy.flushIndices().then(() => {
        cy.get('#utility_delete_indexDelete').click()
        cy.get('#utility_delete_indexDelete', { timeout: 1000 }).should('not.have.class', 'v-btn v-btn--loader')
        cy.wait(250)
        cy.catIndices().then(response => {
          expect(response.body).to.be.empty
          expect(response.body).to.have.lengthOf(0)
        })
      })
    })
  })
})
