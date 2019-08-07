describe('QueryRest', () => {
  beforeEach(() => {
    cy.quickConnect()
    cy.cleanupElasticsearch()
    cy.createIndex('testindex')
    cy.visit('/query/rest')
  })

  it('can execute with default settings', () => {
    cy.get('#reset-form').click()
    cy.get('button[type="submit"]').click()
    cy.get('div.response').contains('cluster_name')
  })

  it('can execute example 1', () => {
    cy.get('#reset-form').click()
    cy.get('#example-1').click()
    cy.get('button[type="submit"]').click()
    cy.get('div.response').contains('health')
    cy.get('div.response').contains('testindex')
  })

  it('can execute example 2', () => {
    cy.get('#reset-form').click()
    cy.get('#example-2').click()
    cy.get('button[type="submit"]').click()
    cy.get('div.response').contains('acknowledged')
    cy.get('div.response').contains('shards_acknowledged')

    cy.catIndices().then(response => {
      let names = response.body.map(i => i.index)
      cy.get('#path').invoke('val').then(val => {
        expect(names).to.contain(val)
      })
    })
  })

  it('can execute example 3', () => {
    cy.createIndex('example_test_index')
    cy.get('#reset-form').click()
    cy.get('#example-3').click()
    cy.get('button[type="submit"]').click()
    cy.get('div.response').contains('acknowledged')
  })
})
