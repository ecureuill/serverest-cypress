Cypress.Commands.add('deleteUsers', (users) => {
  for(const user of users) {
    cy.deleteUser(user);
  }
})
Cypress.Commands.add('deleteUser', (user) => {
  cy.request({
    url: `/usuarios?email=${user.email}`,
    method: 'GET',
    failOnStatusCode: false
  }).then((response) => {
    if(response.status == 200 && response.body.quantidade == 1){
      const id = response.body.usuarios[0]._id;    
      cy.request({
        url: `/usuarios/${id}`,
        method: 'DELETE',
        failOnStatusCode: false
      }).then((response) => response);
    }
  });
})

Cypress.Commands.add('deleteUserById', (id) => {
  cy.request({
    url: `/usuarios/${id}`,
    method: 'DELETE',
    failOnStatusCode: false
  }).should((response) => response)
})

Cypress.Commands.add('insertUsers', (users) => {
  for(const user of users){
    cy.insertUser(user);
  }
})

Cypress.Commands.add('insertUser', (user) => {
  cy.request({
    url: '/usuarios',
    method: 'POST',
    body: user,
    failOnStatusCode: false
  }).then((response) => response);
})

Cypress.Commands.add('updateUser', (id, data) => {
  cy.request({
    url: `/usuarios/${id}`,
    method: 'PUT',
    body: data,
    failOnStatusCode: false,
  }).then((response) => response);
})
