Cypress.Commands.add('clearUserData', () => {
  cy.fixture("user").then((userData) => {
    cy.deleteUsers(userData.list.data);
    cy.deleteUser(userData.create.success.admin);
    cy.deleteUser(userData.create.success.not_admin);
    cy.deleteUser(userData.create.duplicated);
    cy.deleteUser(userData.edit.success.edition);
    cy.deleteUser(userData.edit.not_found.new_user);
    cy.deleteUser(userData.edit.not_found.duplicated);
    cy.deleteUser(userData.edit.fail.original);
    cy.deleteUser(userData.delete.success);
    cy.deleteUser(userData.delete.fail.has_cart.user);
  })
  cy.fixture("login").then((loginData) => {
    cy.deleteUser(loginData.data.admin);
    cy.deleteUser(loginData.data.not_admin);
  })
  cy.fixture("produtos").then((productData) => {
    cy.deleteUsers(productData.users);
  })
  cy.fixture("cart").then((cartData) => {
    cy.deleteUser(cartData.admin);
    cy.deleteUser(cartData.create.success.data.user);
    cy.deleteUser(cartData.create.duplicated_cart.data.user);
    cy.deleteUser(cartData.create.duplicated_product.data.user);
    cy.deleteUser(cartData.create.insufficient_product.data.user);
    cy.deleteUser(cartData.create.inexistent_product.data.user);
    cy.deleteUser(cartData.create.fail.data.user);
    for(const cart of cartData.list.data.carts){
      cy.deleteUser(cart.user);
    }
    cy.deleteUser(cartData.delete.cancel.data.cart.user);
    cy.deleteUser(cartData.delete.finish.data.cart.user);
  })
})

Cypress.Commands.add('clearDefaultData', () => {
  cy.deleteUserById('0uxuPY0cbmQhpEz1');
})

Cypress.Commands.add('clearProductData', (token) => {
  cy.fixture("produtos").then((productData) => {
    cy.deleteProduct(productData.create.success, token);
    cy.deleteProduct(productData.create.duplicated, token);
    cy.deleteProducts(productData.list, token);
    cy.deleteProduct(productData.delete, token);
    cy.deleteProduct(productData.edit.success.original, token);
    cy.deleteProduct(productData.edit.not_found.new_product, token);
    cy.deleteProduct(productData.edit.not_found.duplicated, token);
    cy.deleteProduct(productData.edit.fail.original, token);
  })
  cy.fixture("cart").then((cartData) => {
    cy.deleteProducts(cartData.create.success.data.products, token);
    cy.deleteProducts(cartData.create.duplicated_cart.data.products, token);
    cy.deleteProducts(cartData.create.duplicated_product.data.products, token);
    cy.deleteProducts(cartData.create.insufficient_product.data.products, token);

    cy.deleteProducts(cartData.list.data.products, token);
    cy.deleteProducts(cartData.delete.cancel.data.products, token);
    cy.deleteProducts(cartData.delete.finish.data.products, token);

  })
  cy.fixture("user").then((userData) => {
    cy.deleteProduct(userData.delete.fail.has_cart.product, token);
  })
})

Cypress.Commands.add('clearCartData', () => {
  cy.fixture("cart").then((cartData) => {
    loginAndCancelCart(cartData.create.success.data.user);
    loginAndCancelCart(cartData.create.duplicated_cart.data.user);
    loginAndCancelCart(cartData.create.duplicated_product.data.user);
    loginAndCancelCart(cartData.create.insufficient_product.data.user);
    loginAndCancelCart(cartData.create.fail.data.user);

    for (const cart of cartData.list.data.carts){
      loginAndCancelCart(cart.user);
    }

    loginAndCancelCart(cartData.delete.cancel.data.cart.user);
    loginAndCancelCart(cartData.delete.finish.data.cart.user);

  })
  cy.fixture("user").then((userData) => {
    loginAndCancelCart(userData.delete.fail.has_cart.user);
  })
  const loginAndCancelCart = (user) => {
    cy.login({
      email: user.email,
      password: user.password
    }).then((response) => {
      if (response.status == 200) {
        const token = response.body.authorization;
        cy.cancelCart(token);
      }
    })
  }
})