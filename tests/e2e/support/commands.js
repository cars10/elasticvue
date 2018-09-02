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

Cypress.Commands.add('connect', () => {
  cy.clearLocalStorage()
  cy.visit('/')
  cy.get('#host').clear()
  cy.get('#host').type('http://localhost:' + Cypress.env('ES_PORT').toString())
  cy.get('#test_connection').click()
  cy.get('#connect:not([disabled])').click()
  cy.contains('Node Information').should('exist') // wait until first page is loaded
})

Cypress.Commands.add('quickConnect', () => {
  cy.clearLocalStorage()
  cy.visit('/', {
    onBeforeLoad: window => {
      window.localStorage.setItem('elasticvuex', '{"connection":{"wasConnected":true,"elasticsearchHost":"http://localhost:9123"}}')
    }
  })
})

Cypress.Commands.add('cleanupElasticsearch', () => {
  cy.request('DELETE', 'http://localhost:' + Cypress.env('ES_PORT').toString() + '/_all')
})

Cypress.Commands.add('createIndex', indexName => {
  cy.visit('/indices')
  cy.get('#new_index').click()
  cy.get('#index_name').clear()
  cy.get('#index_name').type(indexName)
  cy.get('#create_index').click()
})

Cypress.Commands.add('catIndices', () => {
  cy.request({
    method: 'GET',
    url: 'http://localhost:' + Cypress.env('ES_PORT').toString() + '/_cat/indices',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
})

Cypress.Commands.add('flushIndices', () => {
  return cy.request({
    method: 'POST',
    url: 'http://localhost:' + Cypress.env('ES_PORT').toString() + '/_all/_flush',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
})
