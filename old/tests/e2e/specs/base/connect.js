describe('Connection', () => {
  it('can connect to a running cluster', () => {
    cy.connect(true)
    cy.contains('div.v-card__title', 'Node Information').should('exist')
  })

  it('can connect to a running cluster without testing first', () => {
    cy.connect()
    cy.contains('div.v-card__title', 'Node Information').should('exist')
  })

  it('cannot connect to a non existing cluster', () => {
    cy.visit('/cluster/0/', {
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
