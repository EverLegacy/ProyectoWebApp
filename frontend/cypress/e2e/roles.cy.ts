/// <reference types="cypress" />


describe('Roles y permisos', () => {
  beforeEach(() => {
    cy.fixture('users.json').as('users');
  });

  it('un admin SÍ puede crear una recompensa nueva', function () {
    cy.request('POST', 'http://localhost:3000/api/auth/login', {
      email: this.users.admin.email,
      password: this.users.admin.password,
    }).then((loginResp) => {
      const token = loginResp.body.token;
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/rewards',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          name: `Cypress Reward ${Date.now()}`,
          description: 'Creada por test automatizado',
          points_cost: 50,
          stock: 10,
        },
      }).then((resp) => {
        expect(resp.status).to.eq(201);
        expect(resp.body.name).to.include('Cypress Reward');
      });
    });
  });

  it('un usuario regular NO puede crear una recompensa (403)', function () {
    cy.registerUser(this.users.newUser.name, this.users.newUser.email, this.users.newUser.password);
    cy.request('POST', 'http://localhost:3000/api/auth/login', {
      email: this.users.newUser.email,
      password: this.users.newUser.password,
    }).then((loginResp) => {
      const token = loginResp.body.token;
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/rewards',
        headers: { Authorization: `Bearer ${token}` },
        body: { name: 'No debería crearse', description: 'x', points_cost: 10, stock: 1 },
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.eq(403);
      });
    });
  });

  it('un visitante sin token NO puede crear una recompensa (401)', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/rewards',
      body: { name: 'No debería crearse', description: 'x', points_cost: 10, stock: 1 },
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eq(401);
    });
  });
});
