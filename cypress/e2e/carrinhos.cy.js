import qs from 'qs';

describe('POST /carrinhos', () => {
  let cartData;

  before(() => {
    cy.fixture('cart').then((data) => {
      cartData = data.create;

      cy.insertUser(data.admin);
      cy.login({ 'email': data.admin.email, 'password': data.admin.password }).then((response) => {
        Cypress.env('adminToken', response.body.authorization);
      })
    })
  })

  it('Should create a cart', () => {
    const user = cartData.success.data.user;
    cy.insertUser(user);
    cy.login({ 'email': user.email, 'password': user.password }).then((response) => {
      const userToken = response.body.authorization;
      cy.cancelCart(userToken);
      cy.insertProducts(cartData.success.data.products, Cypress.env('adminToken'));

      cy.createCartWithItems(cartData.success.items, userToken).should(({ response }) => {
        expect(response.status).to.be.equal(201);
        expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
      });
    })
  })

  it('Should not create more then one cart', () => {
    const user = cartData.duplicated_cart.data.user;
    cy.insertUser(user);
    cy.login({ 'email': user.email, 'password': user.password }).then((response) => {
      const userToken = response.body.authorization;
      cy.cancelCart(userToken);
      cy.insertProducts(cartData.duplicated_cart.data.products, Cypress.env('adminToken'));

      cy.createCartWithItems(cartData.duplicated_cart.items, userToken).then(() => {
        cy.createCartWithItems(cartData.duplicated_cart.items, userToken).should(({ response }) => {
          expect(response.status).to.be.equal(400);
          expect(response.body).to.have.property('message', 'Não é permitido ter mais de 1 carrinho');
        });
      })
    })
  })

  it('Should not create a cart with duplicated product', () => {
    const user = cartData.duplicated_product.data.user;
    cy.insertUser(user);
    cy.login({ 'email': user.email, 'password': user.password }).then((response) => {
      const userToken = response.body.authorization;
      cy.cancelCart(userToken);
      cy.insertProducts(cartData.duplicated_product.data.products, Cypress.env('adminToken'));

      cy.createCartWithItems(cartData.duplicated_product.items, userToken).should(({ response }) => {
        expect(response.status).to.be.equal(400);
        expect(response.body).to.have.property('message', 'Não é permitido possuir produto duplicado');
      });
    })
  })
  it('Should not create a cart with an inexistent product', () => {
    const user = cartData.inexistent_product.data.user;
    cy.insertUser(user);
    cy.login({ 'email': user.email, 'password': user.password }).then((response) => {
      const userToken = response.body.authorization;
      cy.cancelCart(userToken);

      cy.log(cartData.inexistent_product.items)
      cy.createCart(cartData.inexistent_product.cart, userToken).should((response) => {
        expect(response.status).to.be.equal(400);
        expect(response.body).to.have.property('message', 'Produto não encontrado');
      });
    })
  })

  it('Should not create a cart with an insufficient quantity of product', () => {
    const user = cartData.insufficient_product.data.user;
    cy.insertUser(user);
    cy.login({ 'email': user.email, 'password': user.password }).then((response) => {
      const userToken = response.body.authorization;
      cy.cancelCart(userToken);
      cy.insertProducts(cartData.insufficient_product.data.products, Cypress.env('adminToken'));

      cy.createCartWithItems(cartData.insufficient_product.items, userToken).should(({ response }) => {
        expect(response.status).to.be.equal(400);
        expect(response.body).to.have.property('message', 'Produto não possui quantidade suficiente');
      });
    })
  })

  it('Should not create a cart with invalid data', () => {
    const user = cartData.fail.data.user;
    cy.insertUser(user);
    cy.login({ 'email': user.email, 'password': user.password }).then((response) => {
      const userToken = response.body.authorization;
      cy.cancelCart(userToken);

      cy.createCart(cartData.fail.invalid, userToken).should((response) => {
        expect(response.status).to.be.equal(400);
        expect(response.body).to.have.property('produtos[0].idProduto', 'produtos[0].idProduto não pode ficar em branco');
        expect(response.body).to.have.property('produtos[0].quantidade', 'produtos[0].quantidade deve ser um número');
        expect(response.body).to.have.property('produtos', 'produtos não contém 1 valor obrigatório');

      });
    })
  })
})

describe('GET /carrinhos', () => {
  let cartData;

  before(() => {
    cy.fixture('cart').then((data) => {
      cartData = data.list;

      cy.insertUser(data.admin);
      cy.login({
        'email': data.admin.email,
        'password': data.admin.password
      }).then((response) => {
        const adminToken = response.body.authorization;
        cy.insertProducts(cartData.data.products, adminToken);
      })

      cy.clearCartData();
      for (const cart of cartData.data.carts) {
        cy.insertUser(cart.user);
        cy.login({
          "email": cart.user.email,
          "password": cart.user.password
        }).then((response) => {
          cy.createCartWithItems(cart.items, response.body.authorization);
        })
      }
    })
  })

  it('Should list all carts', () => {
    const CART_DEFAULT_COUNT = 1;

    cy.listCarts().should((response) => {
      expect(response.status).to.be.equal(200);
      expect(response.body).to.have.property('quantidade', CART_DEFAULT_COUNT + cartData.all.quantity);
      expect(response.body.carrinhos.length).to.be.equal(CART_DEFAULT_COUNT + cartData.all.quantity);
    });

  })

  it('Should filter carts', () => {
    for (const params of cartData.filtered.success.params) {
      cy.listCarts(qs.stringify(params.input)).should((response) => {
        expect(response.status).to.be.equal(200);
        expect(response.body).to.have.property('quantidade', params.output.quantity);
        expect(response.body.carrinhos.length).to.be.equal(params.output.quantity);
        expect(response.body.carrinhos[0]).include(params.input)
      });
    }
  })

  it('Should not filter cart with inexistent data', () => {
    for (const params of cartData.filtered.not_found.params) {
      cy.listCarts(qs.stringify(params.input)).should((response) => {
        expect(response.status).to.be.equal(200);
        expect(response.body).to.have.property('quantidade', params.output.quantity);
        expect(response.body.carrinhos.length).to.be.equal(params.output.quantity);
      });
    }
  })

  it('Should not filter carts with invalid data', () => {
    const params = cartData.filtered.fail.params;
    cy.listCarts(qs.stringify(params)).should((response) => {
      expect(response.status).to.be.equal(400);
      expect(response.body).to.deep.equal(cartData.filtered.fail.output)
    })
  })
  it('Should find a cart by id', () => {
    cy.listCarts(qs.stringify(cartData.find.param)).then((response) => {
      const cart = response.body.carrinhos[0];
      cy.listCartById(cart._id).should((response) => {
        expect(response.body).to.deep.equal(cart);
      })
    });

  })
})

describe('DELETE /carrinhos', () => {
  let cartData;
  before(() => {
    cy.clearCartData();
    cy.fixture("cart").then((data) => {
      cartData = data.delete;

      cy.insertUser(data.admin);
      cy.login({
        'email': data.admin.email,
        'password': data.admin.password
      }).then((response) => {
        const adminToken = response.body.authorization;
        cy.insertProducts(cartData.cancel.data.products, adminToken);
        cy.insertProducts(cartData.finish.data.products, adminToken);
      })
    })
  })

  it('Should cancel a cart and return products to stock', () => {
    const cart = cartData.cancel.data.cart;
    cy.insertUser(cart.user);
    cy.login({
      "email": cart.user.email,
      "password": cart.user.password
    }).then((response) => {
      const token = response.body.authorization;
      cy.createCartWithItems(cart.items, token).then(({ produtos }) => {

        const productQuantityInCart = produtos[0].quantidade;
        cy.listProductById(produtos[0].idProduto).then((response) => {
          const productStockQuantity = response.body.quantidade;

          cy.cancelCart(token).then((response) => {
            cy.listProductById(produtos[0].idProduto).should((respProduct) => {
              expect(respProduct.body.quantidade).to.be.equal(productStockQuantity + productQuantityInCart);
              expect(response.status).to.be.equal(200);
              expect(response.body).to.have.property('message', 'Registro excluído com sucesso');
            })
          })
        })
      });
    })

  })

  it('Should not cancel if user do not have a cart', () => {
    const cart = cartData.cancel.data.cart;
    cy.insertUser(cart.user);
    cy.login({
      "email": cart.user.email,
      "password": cart.user.password
    }).then((response) => {
      const token = response.body.authorization;
      cy.cancelCart(token).should((response) => {
        expect(response.status).to.be.equal(200);
        expect(response.body).to.have.property('message', 'Não foi encontrado carrinho para esse usuário');
      });
    });
  })

  it('Should checkout a cart', () => {
    const cart = cartData.finish.data.cart;
    cy.insertUser(cart.user);
    cy.login({
      "email": cart.user.email,
      "password": cart.user.password
    }).then((response) => {
      const token = response.body.authorization;
      cy.createCartWithItems(cart.items, token).then(({ produtos }) => {

        const productQuantityInCart = produtos[0].quantidade;
        cy.listProductById(produtos[0].idProduto).then((response) => {
          const productStockQuantity = response.body.quantidade;

          cy.finishCart(token).then((response) => {
            cy.listProductById(produtos[0].idProduto).should((respProduct) => {
              expect(respProduct.body.quantidade).to.be.equal(productStockQuantity);
              expect(response.status).to.be.equal(200);
              expect(response.body).to.have.property('message', 'Registro excluído com sucesso');
            })
          })
        })
      });
    })
  })

  it('Should not checkout if user do not have a cart', () => {
    const cart = cartData.cancel.data.cart;
    cy.insertUser(cart.user);
    cy.login({
      "email": cart.user.email,
      "password": cart.user.password
    }).then((response) => {
      const token = response.body.authorization;
      cy.finishCart(token).should((response) => {
        expect(response.status).to.be.equal(200);
        expect(response.body).to.have.property('message', 'Não foi encontrado carrinho para esse usuário');
      });
    });
  })
  it('Should not cancel a cart without authorization token', () => {
    cy.cancelCart().should((response) => {
      expect(response.status).to.be.equal(401);
      expect(response.body).to.have.property('message', 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
    });
  })

  it('Should not finish a cart without authorization token', () => {
    cy.finishCart().should((response) => {
      expect(response.status).to.be.equal(401);
      expect(response.body).to.have.property('message', 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
    });
  })
})