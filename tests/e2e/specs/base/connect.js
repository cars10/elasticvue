describe('Connection', () => {
  it('can connect to a running cluster', () => {
    cy.connect()
    cy.contains('h2', 'Node Information').should('exist')
  })

  it('cannot connect to a non existing cluster', () => {
    cy.visit('/', {
      onBeforeLoad: window => {
        window.localStorage.clear()
        expect(window.localStorage.getItem(Cypress.env('LOCALSTORAGE_KEY').toString())).to.be.null
      }
    })
    cy.get('#host').clear()
    cy.get('#host').type('http://localhost:9999')
    cy.get('#test_connection').click()
    cy.get('#test_connection').should('have.class', 'error')
  })
})
