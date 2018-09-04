describe('Footer', () => {
  describe('theme handling', () => {
    beforeEach(() => {
      cy.quickConnect()
    })
    it('defaults to the dark theme', () => {
      cy.get('#app').should('have.class', 'theme--dark')
    })

    it('can change the theme', () => {
      cy.contains('Dark theme').click()
      cy.get('#app').should('not.have.class', 'theme--dark')
      cy.contains('Dark theme').click()
      cy.get('#app').should('have.class', 'theme--dark')
    })
  })

  describe('reset settings', () => {
    beforeEach(() => {
      cy.connect()
    })

    it('does reset localStorage and disconnect', () => {
      cy.visit('/indices')
      cy.get('#resetSettings').click()
      cy.location().should(location => {
        expect(location.pathname).to.eq('/')
      })
      cy.get('h1', {timeout: 10000}).contains('Setup').then(h1 => {
        expect(h1).not.to.be.null
        expect(localStorage.getItem('elasticvuex')).to.be.null
      })
    })

    it('redirects to base url', () => {
      cy.visit('/indices')
      cy.get('#resetSettings').click()
      cy.location().should(location => {
        expect(location.pathname).to.eq('/')
      })
    })
  })
})
