describe('Nodes', () => {
  beforeEach(() => {
    cy.quickConnect()
  })

  describe('grid', () => {
    beforeEach(() => {
      cy.visit('/nodes')
      cy.get('#nodes_list_grid').click()
    })

    it('shows the current node in a grid', () => {
      cy.get('div.v-data-iterator').contains('node.role')
    })

    it('can filter', () => {
      cy.get('#nodes_grid_filter').clear()
      cy.get('#nodes_grid_filter').type('xxxxxxx')

      cy.get('div.v-data-iterator').should(grid => {
        expect(grid).not.to.contain('node.role')
      })

      cy.get('#nodes_grid_filter').clear()
      cy.get('div.v-data-iterator').should(grid => {
        expect(grid).to.contain('node.role')
      })
    })
  })

  describe('table', () => {
    beforeEach(() => {
      cy.visit('/nodes')
      cy.get('#nodes_list_table').click()
    })

    it('shows the current node in a table', () => {
      cy.get('.nodes_table').contains('node.role')
    })

    it('can filter', () => {
      cy.get('#nodes_table_filter').clear()
      cy.get('#nodes_table_filter').type('xxxxxxx')

      cy.get('.nodes_table').should(table => {
        expect(table).not.to.contain('%')
      })

      cy.get('#nodes_table_filter').clear()
      cy.get('.nodes_table').should(table => {
        expect(table).to.contain('%')
      })
    })
  })
})
