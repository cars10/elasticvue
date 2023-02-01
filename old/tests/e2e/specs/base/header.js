describe('Header', () => {
  describe('navbar instance management', () => {
    beforeEach(() => {
      cy.quickConnect()
    })

    it('shows the current cluster name', () => {
      cy.get('#instance_selection_toggle').should('contain', 'local')
    })

    it('can open the instance selection menu', () => {
      cy.get('#instance_selection_toggle').click()
      cy.get('#elasticsearch-clusters').should('contain', 'local')
      cy.get('#elasticsearch-clusters').should('contain', 'http://localhost:' + Cypress.env('ES_PORT').toString())
    })

    it('can delete the last instance', () => {
      cy.get('#instance_selection_toggle').click()
      cy.get('#remove-instance-0').click().then(() => {
        const state = JSON.parse(window.localStorage.getItem('elasticvuex'))
        expect(state.connection.instances.length).to.equal(0)
      })
    })

    it('can add new instances', () => {
      cy.get('#instance_selection_toggle').click()
      cy.get('#add_new_instance').click()
      cy.get('#new_instance_uri').clear()
      cy.get('#new_instance_uri').type('http://localhost:' + Cypress.env('ES_PORT').toString())
      cy.get('#test_connection').click()
      cy.get('#connect').click().then(() => {
        cy.wait(250)
        cy.reload(true)
        const state = JSON.parse(window.localStorage.getItem('elasticvuex'))
        expect(state.connection.instances.length).to.equal(2)
      })
    })

    it('can add new instances with custom name', () => {
      const name = 'custom-cluster'
      cy.get('#instance_selection_toggle').click()
      cy.get('#add_new_instance').click()
      cy.get('#new_instance_name').clear()
      cy.get('#new_instance_name').type(name)
      cy.get('#new_instance_uri').clear()
      cy.get('#new_instance_uri').type('http://localhost:' + Cypress.env('ES_PORT').toString())
      cy.get('#test_connection').click()
      cy.get('#connect').click().then(() => {
        cy.wait(250)
        cy.reload(true)
        const state = JSON.parse(window.localStorage.getItem('elasticvuex'))
        expect(state.connection.instances[1].name).to.equal(name)
        cy.get('#instance_selection_toggle').should('contain', name)
      })
    })
  })
})
