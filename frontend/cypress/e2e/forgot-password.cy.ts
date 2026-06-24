/// <reference types="cypress" />



describe('Recuperación de contraseña', () => {
  beforeEach(function () {
    cy.fixture('users.json').as('users');
  });

  it('genera un token y permite restablecer la contraseña', function () {
    const email = `cypress.forgot.${Date.now()}@example.com`;
    cy.registerUser('Cypress Forgot User', email, 'OldPass123!');

    cy.visit('/forgot-password');
    cy.get('[data-testid="forgot-email"]').type(email);
    cy.get('[data-testid="forgot-submit"]').click();

    cy.get('[data-testid="forgot-token-display"]').should('be.visible')
      .invoke('text')
      .then((text) => {
        
        const match = text.match(/[a-f0-9]{40}/);
        expect(match, 'token shown on screen').to.not.be.null;
        const token = match![0];

        cy.visit('/reset-password');
        cy.get('[data-testid="reset-token"]').type(token);
        cy.get('[data-testid="reset-new-password"]').type('NewPass456!');
        cy.get('[data-testid="reset-submit"]').click();

        cy.get('[data-testid="reset-success"]').should('be.visible');

       
        cy.visit('/login');
        cy.get('[data-testid="login-email"]').type(email);
        cy.get('[data-testid="login-password"]').type('NewPass456!');
        cy.get('[data-testid="login-submit"]').click();
        cy.url().should('include', '/dashboard');
      });
  });

  it('rechaza un token inválido', () => {
    cy.visit('/reset-password');
    cy.get('[data-testid="reset-token"]').type('token-que-no-existe');
    cy.get('[data-testid="reset-new-password"]').type('CualquierPass1!');
    cy.get('[data-testid="reset-submit"]').click();
    cy.get('[data-testid="reset-error"]').should('be.visible');
  });
});
