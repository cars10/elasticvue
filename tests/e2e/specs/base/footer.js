describe('Footer', () => {
  beforeEach(() => {
    cy.quickConnect()
  })

  describe('theme handling', () => {
    it('defaults to the dark theme', () => {
      cy.get('#app').should('have.class', 'theme--dark')
    })

    it('can change the theme', () => {
      cy.get('button[title="Change theme"]').click()
      cy.get('#app').should('not.have.class', 'theme--dark')
      cy.get('button[title="Change theme"]').click()
      cy.get('#app').should('have.class', 'theme--dark')
    })
  })
})
