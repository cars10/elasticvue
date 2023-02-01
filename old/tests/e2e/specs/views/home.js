describe('Home page', () => {
  beforeEach(() => {
    cy.quickConnect()
  })

  describe('node information', () => {
    it('shows the current node information', () => {
      cy.get('div.v-card__title').contains('Node Information').should('exist')
      cy.contains('cluster_uuid').should('exist')
    })
  })

  describe('cluster health', () => {
    it('shows the cluster health', () => {
      cy.get('div.v-card__title').contains('Cluster Health').should('exist')
      cy.contains('status').should('exist')
    })
  })
})
