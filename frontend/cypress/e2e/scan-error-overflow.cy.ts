
describe('Flujo de error crítico — monto fuera de rango', () => {
  it('muestra un mensaje de error cuando el monto de compra excede el límite del sistema', () => {
    const email = `cypress.overflow.${Date.now()}@example.com`;
    const password = 'OverflowPass123!';

    cy.registerUser('Cypress Overflow User', email, password);
    cy.visit('/login');
    cy.get('[data-testid="login-email"]').type(email);
    cy.get('[data-testid="login-password"]').type(password);
    cy.get('[data-testid="login-submit"]').click();
    cy.url().should('include', '/dashboard');

    cy.get('[data-testid="simulate-purchase-button"]').click();
    cy.get('[data-testid="scan-store-select"]').select(1);
    cy.get('[data-testid="scan-amount-input"]').type('99999999999'); // excede INTEGER (~2.1 mil millones)
    cy.get('[data-testid="scan-submit"]').click();

    cy.contains('Error al registrar la compra.').should('be.visible');
  });
});