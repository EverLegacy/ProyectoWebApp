/// <reference types="cypress" />


describe('Flujo principal del negocio', () => {
  it('completa el ciclo completo: registro, ganar puntos, canjear recompensa, logout', () => {
    const name = 'Cypress Core Flow User';
    const email = `cypress.coreflow.${Date.now()}@example.com`;
    const password = 'CoreFlow123!';

    
    cy.visit('/register');
    cy.get('[data-testid="register-name"]').type(name);
    cy.get('[data-testid="register-email"]').type(email);
    cy.get('[data-testid="register-password"]').type(password);
    cy.get('[data-testid="register-submit"]').click();
    cy.url().should('include', '/login');

    
    cy.get('[data-testid="login-email"]').type(email);
    cy.get('[data-testid="login-password"]').type(password);
    cy.get('[data-testid="login-submit"]').click();
    cy.url().should('include', '/dashboard');

    
    cy.get('[data-testid="simulate-purchase-button"]').click();
    cy.get('[data-testid="scan-store-select"]').select(1); 
    cy.get('[data-testid="scan-amount-input"]').type('500');
    cy.get('[data-testid="scan-submit"]').click();
    cy.contains('Ganaste 500 puntos').should('be.visible');

    
    cy.visit('/rewards');
    cy.get('[data-testid^="reward-redeem-"]:not([disabled])').first().click();

    
    cy.get('[data-testid="redeem-confirm-modal"]').should('be.visible');
    cy.get('[data-testid="redeem-confirm"]').click();

    
    cy.get('[data-testid="redeem-success-modal"]').should('be.visible');
    cy.get('[data-testid="redeem-success-close"]').click();

    
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('not.include', '/dashboard');
  });
});