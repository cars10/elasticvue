describe('Home page', () => {
  beforeEach(() => {
    cy.cleanupElasticsearch()
    cy.connect()
  })

  describe('node information', () => {
    it('shows the current node information', () => {
      cy.get('h2').contains('Node Information')
      cy.contains('cluster_uuid')
    })
  })

  describe('cluster health', () => {
    it('shows the cluster health', () => {
      cy.get('h2').contains('Cluster Health')
      cy.contains('status')
    })
  })
})
