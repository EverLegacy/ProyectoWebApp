/// <reference types="cypress" />


describe('Autenticación', () => {
  beforeEach(() => {
    cy.fixture('users.json').as('users');
  });

  describe('Registro de usuario nuevo', () => {
    it('crea una cuenta nueva y redirige a login', function () {
      const unique = `cypress.${Date.now()}@example.com`;
      cy.visit('/register');

      cy.get('[data-testid="register-name"]').type(this.users.newUser.name);
      cy.get('[data-testid="register-email"]').type(unique);
      cy.get('[data-testid="register-password"]').type(this.users.newUser.password);
      cy.get('[data-testid="register-submit"]').click();

      cy.url().should('include', '/login');
    });

    it('muestra un error si el email ya está registrado', function () {
      
      cy.registerUser(this.users.newUser.name, this.users.newUser.email, this.users.newUser.password);

      cy.visit('/register');
      cy.get('[data-testid="register-name"]').type(this.users.newUser.name);
      cy.get('[data-testid="register-email"]').type(this.users.newUser.email);
      cy.get('[data-testid="register-password"]').type(this.users.newUser.password);
      cy.get('[data-testid="register-submit"]').click();

      cy.get('[data-testid="register-error"]').should('be.visible');
    });
  });

  describe('Login', () => {
    beforeEach(function () {
      
      cy.registerUser(this.users.newUser.name, this.users.newUser.email, this.users.newUser.password);
    });

    it('inicia sesión con credenciales válidas y llega al dashboard', function () {
      cy.visit('/login');
      cy.get('[data-testid="login-email"]').type(this.users.newUser.email);
      cy.get('[data-testid="login-password"]').type(this.users.newUser.password);
      cy.get('[data-testid="login-submit"]').click();

      cy.url().should('include', '/dashboard');
    });

    it('muestra error con credenciales inválidas', function () {
      cy.visit('/login');
      cy.get('[data-testid="login-email"]').type(this.users.invalidLogin.email);
      cy.get('[data-testid="login-password"]').type(this.users.invalidLogin.password);
      cy.get('[data-testid="login-submit"]').click();

      cy.get('[data-testid="login-error"]').should('be.visible');
      cy.url().should('include', '/login'); // no debe navegar al dashboard
    });
  });

  describe('Logout', () => {
    it('cierra sesión y redirige fuera del área protegida', function () {
      cy.loginAs(this.users.newUser.email, this.users.newUser.password);
      cy.visit('/dashboard');
      cy.get('[data-testid="logout-button"]').click();
      cy.url().should('not.include', '/dashboard');
    });
  });
});
