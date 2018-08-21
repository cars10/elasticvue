describe('Home page', () => {
  beforeEach(() => {
    cy.cleanupElasticsearch()
    cy.connect()
  })

  describe('node information', () => {
    it('shows the current node information', () => {
      cy.get('h2').contains('Node Information').should('exist')
      cy.contains('cluster_uuid').should('exist')
    })
  })

  describe('cluster health', () => {
    it('shows the cluster health', () => {
      cy.get('h2').contains('Cluster Health').should('exist')
      cy.contains('status').should('exist')
    })
  })
})
