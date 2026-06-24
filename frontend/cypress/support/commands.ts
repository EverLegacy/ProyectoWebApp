/// <reference types="cypress" />

Cypress.Commands.add('loginAs', (email: string, password: string) => {
  cy.request('POST', 'http://localhost:3000/api/auth/login', { email, password })
    .then((resp) => {
      window.localStorage.setItem('token', resp.body.token);
    });
});

Cypress.Commands.add('registerUser', (name: string, email: string, password: string) => {
  return cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/register',
    body: { name, email, password },
    failOnStatusCode: false, 
  });
});

declare global {
  
  namespace Cypress {
    interface Chainable {
      loginAs(email: string, password: string): Chainable<void>;
      registerUser(name: string, email: string, password: string): Chainable<Cypress.Response<any>>;
    }
  }
}

export {};
