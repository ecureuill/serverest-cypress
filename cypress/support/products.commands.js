Cypress.Commands.add('listProducts', (params = undefined) => {
  cy.request({
    url: params ? `/produtos?${params}` : '/produtos',
    method: 'GET',
    failOnStatusCode: false
  }).then((response) => response);
})

Cypress.Commands.add('listProductById', (id) => {
  cy.request({
    url: `/produtos/${id}`,
    method: 'GET',
    failOnStatusCode: false
  }).then((response) => response);
})

Cypress.Commands.add('listProductByName', (name) => {
  cy.request({
    url: `/produtos?nome=${name}`,
    method: 'GET',
    failOnStatusCode: false
  }).then((response) => response);
})


Cypress.Commands.add('insertProducts', (products, token) => {
  for(const product of products){
    cy.insertProduct(product, token);
  }
})

Cypress.Commands.add('insertProduct', (product, token) => {
  cy.request({
    url: '/produtos',
    method: 'POST',
    body: product,
    headers: {
      authorization: token
    },
    failOnStatusCode: false
  }).then((response) => response)
})

Cypress.Commands.add('deleteProducts', (products, token) => {
  for(const product of products){
    cy.deleteProduct(product, token);
  }
})
Cypress.Commands.add('deleteProduct', (product, token=undefined) => {
  cy.listProductByName(product.nome).then((response) => {
    if(response.status == 200 && response.body.quantidade == 1){
      const id = response.body.produtos[0]._id;    
      cy.deleteProductById(id, token);
    }
  });
})

Cypress.Commands.add('deleteProductById', (id, token) => {
  cy.request({
    url: `/produtos/${id}`,
    method: 'DELETE',
    headers: {
      authorization: token
    },
    failOnStatusCode: false
  })
})

Cypress.Commands.add('updateProduct', (id, data, token) => {
  cy.request({
    url: `/produtos/${id}`,
    method: 'PUT',
    headers: {
      authorization: token
    },
    body: data,
    failOnStatusCode: false
  })
})