describe('Footer', () => {
  describe('theme handling', () => {
    it('defaults to the dark theme', () => {
      cy.connect()
      cy.get('#app').should('have.class', 'theme--dark')
    })

    it('can change the theme', () => {
      cy.connect()
      cy.contains('Dark theme').click()
      cy.get('#app').should('not.have.class', 'theme--dark')
      cy.contains('Dark theme').click()
      cy.get('#app').should('have.class', 'theme--dark')
    })
  })
})
