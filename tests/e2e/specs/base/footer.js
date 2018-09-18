describe('Footer', () => {
  beforeEach(() => {
    cy.cleanupElasticsearch()
    cy.connect()
  })

  describe('theme handling', () => {
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
    it('does reset localStorage and disconnect', () => {
      cy.visit('/indices')
      cy.get('table').should(table => {
        expect(table).to.contain('No data available')
      })
      cy.get('#resetSettings').click()
      cy.location().should(location => {
        expect(location.pathname).to.eq('/')
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
