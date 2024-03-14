Cypress.Commands.add('createCartWithItems', (items, token) => {
  let cart = { "produtos" : []};

  for(const item of items){
    cy.listProductByName(item.nome).then((response) => {
      if (response.status == 200 && response.body.quantidade == 1) {
        const id = response.body.produtos[0]._id;
        cart.produtos.push({
          "idProduto": id,
          "quantidade": item.quantidade
        });
      }
    });
  }

  cy.createCart(cart, token).then((response) => {return {
    "produtos": cart.produtos,
    "response": response 
  }});

});

Cypress.Commands.add('createCart', (cart, token) => {
  cy.request({
    url: "/carrinhos",
    method: "POST",
    headers: {
      authorization: token
    },
    body: cart,
    failOnStatusCode: false
  });
})

Cypress.Commands.add('listCarts', (params = undefined) => {
  cy.request({
    url: params? `/carrinhos?${params}` : '/carrinhos',
    method: 'GET',
    failOnStatusCode: false
  }).then((response) => response);
})

Cypress.Commands.add('listCartById', (id) => {
  cy.request({
    url: `/carrinhos/${id}`,
    method: 'GET',
    failOnStatusCode: false
  }).then((response) => response);
})

Cypress.Commands.add('cancelCart', (token) => {
  cy.request({
    url: '/carrinhos/cancelar-compra',
    method: 'DELETE',
    headers: {
      authorization: token
    },
    failOnStatusCode: false
  })
})


Cypress.Commands.add('finishCart', (token) => {
  cy.request({
    url: '/carrinhos/concluir-compra',
    method: 'DELETE',
    headers: {
      authorization: token
    },
    failOnStatusCode: false
  }).then((response) => response);
})