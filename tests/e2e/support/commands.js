// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const ELASTICSEARCH_URL = 'http://localhost:' + Cypress.env('ES_PORT').toString()

Cypress.Commands.add('connect', () => {
  cy.visit('/', {
    onBeforeLoad: window => {
      window.localStorage.clear() // https://github.com/cypress-io/cypress/issues/2695#issuecomment-435147776
      expect(window.localStorage.getItem('elasticvuex')).to.be.null
    }
  })

  cy.get('#host').clear()
  cy.get('#host').type(ELASTICSEARCH_URL)
  cy.get('#test_connection').click()
  cy.get('#connect:not([disabled])').click()
  cy.contains('Node Information').should('exist') // wait until first page is loaded
})

Cypress.Commands.add('quickConnect', () => {
  cy.visit('/', {
    onBeforeLoad: window => {
      window.localStorage.clear() // https://github.com/cypress-io/cypress/issues/2695#issuecomment-435147776
      expect(window.localStorage.getItem('elasticvuex')).to.be.null
      window.localStorage.setItem('elasticvuex', `{"connection":{"wasConnected":true,"elasticsearchHost":"${ELASTICSEARCH_URL}"}}`)
    }
  })
  cy.contains('cluster_uuid').should('exist')
})

Cypress.Commands.add('cleanupElasticsearch', () => {
  return cy.request('DELETE', ELASTICSEARCH_URL + '/_all')
})

Cypress.Commands.add('catIndices', () => {
  return cy.request({
    method: 'GET',
    url: ELASTICSEARCH_URL + '/_cat/indices',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
})

Cypress.Commands.add('createIndex', indexName => {
  return cy.request('PUT', 'http://localhost:' + Cypress.env('ES_PORT').toString() + '/' + indexName)
})

Cypress.Commands.add('flushIndices', () => {
  return cy.request({
    method: 'POST',
    url: ELASTICSEARCH_URL + '/_all/_flush',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
})
