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
  cy.contains('cluster_uuid') // wait until first page is loaded
})
