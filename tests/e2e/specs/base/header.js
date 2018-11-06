describe('Header', () => {
  describe('menu links', () => {
    beforeEach(() => {
      cy.quickConnect()
    })

    it('can navigate to home page', () => {
      cy.get('#navbar_home').click()
      cy.url().should('include', '/')
    })

    it('can navigate to nodes page', () => {
      cy.get('#navbar_nodes').click()
      cy.url().should('include', '/nodes')
    })

    it('can navigate to indices page', () => {
      cy.get('#navbar_indices').click()
      cy.url().should('include', '/indices')
    })

    it('can navigate to search page', () => {
      cy.get('#navbar_search').click()
      cy.url().should('include', '/search')
    })

    it('can navigate to query page', () => {
      cy.get('#navbar_query').click()
      cy.url().should('include', '/query')
    })

    it('can navigate to utilities page', () => {
      cy.get('#navbar_utilities').click()
      cy.url().should('include', '/utilities')
    })
  })
})
