describe('Connection', () => {
  it('can connect to a running cluster', () => {
    cy.connect()
    cy.contains('h2', 'Node Information')
  })

  it('cannot connect to a non existing cluster', () => {
    cy.visit('/')
    cy.get('#host').clear()
    cy.get('#host').type('http://localhost:9999')
    cy.get('#test_connection').click()
    cy.get('#test_connection').should('have.class', 'error')
  })
})
