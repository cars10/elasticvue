describe('Header', () => {
  describe('connect and reconnect', () => {
    beforeEach(() => {
      cy.clearLocalStorage()
    })

    it('cannot reconnect when not connected', () => {
      cy.visit('/')
      cy.get('toolbar_host').should('not.exist')
    })

    it('can reconnect when connected', () => {
      cy.quickConnect()
      cy.visit('/indices')
      cy.get('#toolbar_host').should('exist')
      cy.get('#toolbar_reconnect_button').click()
      cy.get('#toolbar_host').should('exist')
      cy.url().should('include', '/indices')
    })

    // TODO: check that it does reset search
  })

  describe('menu links', () => {
    beforeEach(() => {
      cy.clearLocalStorage()
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
