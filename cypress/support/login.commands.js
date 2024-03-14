Cypress.Commands.add('login', (user) => {
  cy.request({
    url: '/login',
    method: 'POST',
    body: user,
    failOnStatusCode: false
  }).then((response) => response);
})