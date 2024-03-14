import qs from 'qs';
describe('GET /produtos', () => {
  let productData;
  before(() => {
    cy.fixture("produtos").then((data) => {
      productData = data.list;
      cy.insertUsers(data.users);

      cy.login(data.login.admin).then((response) => {
        Cypress.env('adminToken', response.body.authorization);
      })
    })

    cy.clearCartData();
  }) 
  
  beforeEach(() => {
    cy.clearProductData(Cypress.env('adminToken'));
  })

  it('Should list products', () => {
    const DEFAULT_PRODUCTS_COUNT = 2;

    cy.insertProducts(productData, Cypress.env('adminToken'));

    cy.listProducts().should((response) => {
      expect(response.status).to.be.equal(200);
      expect(response.body).to.have.property('quantidade', productData.length + DEFAULT_PRODUCTS_COUNT);
      expect(response.body.produtos.length).to.be.equal(productData.length + DEFAULT_PRODUCTS_COUNT);
    })
  })

  it('Should list products filtered by parameters', () => {
    cy.insertProducts(productData, Cypress.env('adminToken'));

    const product = productData[0];
    const filterParams = qs.stringify(product);

    cy.listProducts(filterParams).should((response) => {
      expect(response.status).to.be.equal(200);
      expect(response.body).to.have.property('quantidade', 1);
      expect(response.body.produtos.length).to.be.equal(1);
      expect(response.body.produtos[0]).to.include(product);
    })
  })
  
  it('Should find product by id', () => {
    cy.insertProduct(productData[0], Cypress.env('adminToken')).then((response) => {
        const id = response.body._id;
        cy.listProductById(id).should((response) => {
          expect(response.status).to.be.equal(200);
          expect(response.body).include(productData[0]);
        })
    });
  })
})

describe('POST /produtos', () => {
  let productData;
  before(() => {
    cy.fixture("produtos").then((data) => {
      productData = data.create;
      
      cy.insertUsers(data.users);
      cy.login(data.login.not_admin).then((response) => {
        Cypress.env('userToken', response.body.authorization);
      })
      cy.login(data.login.admin).then((response) => {
        Cypress.env('adminToken', response.body.authorization);
      })
    })
  })

  describe('Admin user', () => {
    beforeEach(() => {
      cy.clearProductData(Cypress.env('adminToken'));
    })

    it('Should create product', () => {
      cy.insertProduct(productData.success, Cypress.env('adminToken')).should((response) => {
        expect(response.status).to.be.equal(201);
        expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso')
      })
    })

    it('Should not create product with invalid data', () => {
      for(const product of productData.invalid){
        cy.insertProduct(product, Cypress.env('adminToken')).should((response) => {
          expect(response.status).to.be.equal(400);
        })
      }
    })

    it('Should not create duplicated product', () => {
      cy.insertProduct(productData.duplicated, Cypress.env('adminToken'));

      cy.insertProduct(productData.duplicated, Cypress.env('adminToken')).should((response) => {
        expect(response.status).to.be.equal(400);
        expect(response.body).to.have.property('message', 'Já existe produto com esse nome');
      })
    })
  })

  it('Should not allow unauthenticated user create product', () =>{
    cy.insertProduct(productData.success).should((response) => {
      expect(response.status).to.be.equal(401);
      expect(response.body).to.have.property('message', 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais')
    })
  })
  it('Should not allow user create product', () => {
    cy.insertProduct(productData.success, Cypress.env('userToken')).should((response) => {
      expect(response.status).to.be.equal(403);
      expect(response.body).to.have.property('message', 'Rota exclusiva para administradores')
    })
  })
})

describe('PUT /produtos', () => {
  let productData;

  before(() => {
    cy.fixture("produtos").then((data) => {
      productData = data.edit;
      cy.insertUsers(data.users);

      cy.login(data.login.not_admin).then((response) => {
        Cypress.env('userToken', response.body.authorization);
      })
      cy.login(data.login.admin).then((response) => {
        Cypress.env('adminToken', response.body.authorization);
      })
    })
  })

  beforeEach(() => {
    cy.clearProductData(Cypress.env('adminToken'));
  })

  describe('Admin user', () => {
    it('Should update a product', () => {
      cy.insertProduct(productData.success.original, Cypress.env('adminToken')).then((response) => {
        const id = response.body._id;
        cy.updateProduct(id, productData.success.updated, Cypress.env('adminToken')).should((response) => {
          expect(response.status).to.be.equal(200);
          expect(response.body).to.have.property('message', 'Registro alterado com sucesso');
        })
      })
    })

    it('Should create a product when attempts to update with inexistent product id', () => {
      cy.updateProduct("inexistent_id", productData.not_found.new_product, Cypress.env('adminToken')).should((response) => {
        expect(response.status).to.be.equal(201);
        expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
      })
    })

    it('Should not create a product when attempts to update with inexistent product id but with existent product name', () => {
      cy.insertProduct(productData.not_found.duplicated, Cypress.env('adminToken'));
    
      cy.updateProduct("inexistent_id", productData.not_found.duplicated, Cypress.env('adminToken')).should((response) => {
        expect(response.status).to.be.equal(400);
        expect(response.body).to.have.property('message', 'Já existe produto com esse nome');
      })
    })

    it('Should not update a product with invalid data', () => {
      cy.insertProduct(productData.fail.original, Cypress.env('adminToken')).then((response) => {
        const id = response.body._id;

        for(const product of productData.fail.invalid){
          cy.updateProduct(id, product, Cypress.env('adminToken')).should((response) => {
            expect(response.status).to.be.equal(400);
          })
        }
      });
    })
  })

  it('Should not allow unauthenticated user to update a product', () => {
    cy.insertProduct(productData.success.original, Cypress.env('adminToken')).then((response) => {
      const id = response.body._id;
      cy.updateProduct(id, productData.success.updated).should((response) => {
        expect(response.status).to.be.equal(401);
        expect(response.body).to.have.property('message', 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
      })
    })
  })

  it('Should not allow a user to update a product', () => {
    cy.insertProduct(productData.success.original, Cypress.env('adminToken')).then((response) => {
      const id = response.body._id;
      cy.updateProduct(id, productData.success.updated, Cypress.env('userToken')).should((response) => {
        expect(response.status).to.be.equal(403);
        expect(response.body).to.have.property('message', 'Rota exclusiva para administradores');
      })
    })
  })
});

describe('DELETE /produtos', () => {
  let productData;

  before(() => {
    cy.fixture("produtos").then((data) => {
      productData = data.delete;

      cy.insertUsers(data.users);
      cy.login(data.login.not_admin).then((response) => {
        Cypress.env('userToken', response.body.authorization);
      })
      cy.login(data.login.admin).then((response) => {
        Cypress.env('adminToken', response.body.authorization);
      })
    })
  })

  beforeEach(() => {
    cy.clearProductData(Cypress.env('adminToken'));
  })

  describe('Admin user', () => {
    it('Should delete a product', () => {
      cy.insertProduct(productData, Cypress.env('adminToken')).then((response) => {
        const id = response.body._id;
        cy.deleteProductById(id, Cypress.env('adminToken')).should((response) => {
          expect(response.status).to.be.equal(200);
          expect(response.body).to.have.property('message', 'Registro excluído com sucesso');
        })
      })
    })

    it('Should not delete an inexistent product', () => {
      cy.deleteProductById("inexistent_id", Cypress.env('adminToken')).should((response) => {
        expect(response.status).to.be.equal(200);
        expect(response.body).to.have.property('message', 'Nenhum registro excluído');
      })
    })

    it('Should not delete a product linked to a cart', () => {
      //TO-DO
    })
  })

  it('Should not allow unauthenticated user to delete a product', () => {
    cy.insertProduct(productData, Cypress.env('adminToken')).then((response) => {
      const id = response.body._id;
      cy.deleteProductById(id).should((response) => {
        expect(response.status).to.be.equal(401);
        expect(response.body).to.have.property('message', 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
      })
    })
  })

  it('Should not allow a user to delete a product', () => {
    cy.insertProduct(productData, Cypress.env('adminToken')).then((response) => {
      const id = response.body._id;
      cy.deleteProductById(id, Cypress.env('userToken')).should((response) => {
        expect(response.status).to.be.equal(403);
        expect(response.body).to.have.property('message', 'Rota exclusiva para administradores');
      })
    })
  })
  
})