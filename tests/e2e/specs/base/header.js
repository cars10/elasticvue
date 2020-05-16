describe('Header', () => {
  describe('navbar cluster health', () => {
    beforeEach(() => {
      cy.quickConnect()
    })

    it('shows the current cluster url', () => {
      cy.get('#navbar_cluster_health').contains('http://localhost:' + Cypress.env('ES_PORT').toString())
    })
  })

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

    it('can navigate to rest query page', () => {
      cy.get('#navbar_query_rest').click()
      cy.url().should('include', '/query/rest')
    })

    it('can navigate to utilities page', () => {
      cy.get('#navbar_utilities').click()
      cy.url().should('include', '/utilities')
    })
  })
})
