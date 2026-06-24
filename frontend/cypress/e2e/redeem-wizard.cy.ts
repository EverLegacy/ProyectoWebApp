/// <reference types="cypress" />


describe('Wizard de canje de recompensas', () => {
  beforeEach(function () {
    cy.fixture('users.json').as('users');
  });

  it('completa el wizard de 3 pasos: seleccionar -> confirmar -> éxito', function () {
    const email = `cypress.wizard.${Date.now()}@example.com`;
    cy.registerUser('Cypress Wizard User', email, 'WizardPass123!').then((resp) => {
      const userId = resp.body.user.id;
     
      
      cy.request('POST', 'http://localhost:3000/api/auth/login', { email, password: 'WizardPass123!' })
        .then((loginResp) => {
          const token = loginResp.body.token;
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/points/add',
            headers: { Authorization: `Bearer ${token}` },
            body: { storeId: 1, amount: 5000 }, 
            failOnStatusCode: false,
          });

          cy.loginAs(email, 'WizardPass123!');
          cy.visit('/rewards');

          
          cy.get('[data-testid^="reward-redeem-"]:not([disabled])').first().click();

          
          cy.get('[data-testid="redeem-confirm-modal"]').should('be.visible');
          cy.get('[data-testid="redeem-confirm-cost"]').should('be.visible');
          cy.get('[data-testid="redeem-confirm"]').click();

          
          cy.get('[data-testid="redeem-success-modal"]').should('be.visible');
          cy.get('[data-testid="redeem-success-close"]').click();
          cy.get('[data-testid="redeem-success-modal"]').should('not.exist');
        });
    });
  });

  it('permite cancelar en el paso de confirmación sin canjear', function () {
    const email = `cypress.wizardcancel.${Date.now()}@example.com`;
    cy.registerUser('Cypress Wizard Cancel User', email, 'WizardPass123!').then(() => {
      cy.request('POST', 'http://localhost:3000/api/auth/login', { email, password: 'WizardPass123!' })
        .then((loginResp) => {
          const token = loginResp.body.token;
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/points/add',
            headers: { Authorization: `Bearer ${token}` },
            body: { storeId: 1, amount: 5000 },
            failOnStatusCode: false,
          });

          cy.loginAs(email, 'WizardPass123!');
          cy.visit('/rewards');

          cy.get('[data-testid^="reward-redeem-"]:not([disabled])').first().click();
          cy.get('[data-testid="redeem-confirm-modal"]').should('be.visible');
          cy.get('[data-testid="redeem-cancel"]').click();
          cy.get('[data-testid="redeem-confirm-modal"]').should('not.exist');
          cy.get('[data-testid="redeem-success-modal"]').should('not.exist');
        });
    });
  });
});
