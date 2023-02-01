describe('Footer', () => {
  beforeEach(() => {
    cy.quickConnect()
  })

  describe('theme handling', () => {
    it('defaults to the dark theme', () => {
      cy.get('#app').should('have.class', 'theme--dark')
    })

    it('can change the theme', () => {
      cy.get('#theme_select').click()
      cy.get('#app').should('not.have.class', 'theme--dark')
      cy.get('#theme_select').click()
      cy.get('#app').should('have.class', 'theme--dark')
    })
  })

  describe('language handling', () => {
    it('defaults to english', () => {
      cy.contains('Node Information').should('exist')
    })

    it('can change the language', () => {
      cy.get('#change_language').click()
      cy.get('#cn_flag').click()
      cy.contains('节点').should('exist')
    })
  })
})
