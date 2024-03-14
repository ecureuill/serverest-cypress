import qs from 'qs';

describe('GET /usuarios', () => {
  let userData; 
  
  before(()=> {
    cy.clearDefaultData();
    cy.clearCartData();
  })

  beforeEach(()=> {
    cy.fixture("user").then((data) => {
      userData = data;
    });

    cy.clearUserData();
  })
  
  it('Should list 0 users', ()=> {
    cy.request('/usuarios').should((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.quantidade).to.equal(0);
      expect(response.body.usuarios).to.be.empty;
    });
  })
  
  it('Should list all users', ()=> {
    const users = userData.list.data;
    cy.insertUsers(users);
    cy.request('/usuarios').should((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.quantidade).to.equal(users.length);
    });
  })

  it('Should list users filtered by parameters', ()=> {
    const users = userData.list.data;
    const filterParams = qs.stringify(users[0]);

    cy.insertUsers(users);
    cy.request({
      url: `/usuarios?${filterParams}`
    }).should((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.quantidade).to.equal(1);
    });
  })

  it('Should list user by id', ()=>{
    cy.insertUsers(userData.list.data);
    const user = userData.list.data[0];
    
    cy.request({
      url: `/usuarios?${qs.stringify(user)}`
    }).then((response) => {
      const id = response.body.usuarios[0]._id;
      
      cy.request({
        url: `/usuarios/${id}`
      }).should((response) => {
        expect(response.body).to.include(user);
        expect(response.body).to.have.property('_id', id);
      });
    });
  })
})

describe('POST /usuarios', () => {
  let userData;
  beforeEach(()=> {
    cy.fixture("user").then((data) => {
      userData = data.create;
    });
  })

  it('Should successfully create an admin user', () =>{
    const user = userData.success.admin;
    cy.deleteUser(user);

    cy.insertUser(user).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.message).to.be.equal('Cadastro realizado com sucesso');
    });
  })

  it('Should successfully create a not admin user', () =>{
    const user = userData.success.not_admin;
    cy.deleteUser(user);
    
    cy.insertUser(user).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.message).to.be.equal('Cadastro realizado com sucesso');
    });
  })
  
  it('Should not create a duplicated user', () => {
    const user = userData.duplicated;
    cy.deleteUser(user);

    cy.insertUser(user).then(() => {
      cy.insertUser(user).should((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('message', 'Este email já está sendo usado');
      })
    })
  });

  it('Should not create a user with invalid data', () => {
    const users = userData.invalid;

    for(const user of users){
      cy.insertUser(user).should((response) => {
        expect(response.status).to.equal(400);
      })
    }
  })
})

describe('PUT /usuarios', () => {
  let userData;
  before(()=> {
    cy.fixture("user").then((data) => {
      userData = data.edit;
    });
  })

  it('Should update successfully user data', () => {
    const user = userData.success.user;
    const updatedUser = userData.success.edition;
    cy.deleteUser(user);

    cy.insertUser(user).then((response) => {
      const id = response.body._id;
      cy.updateUser(id, updatedUser).should((response) => {
        expect(response.status).to.be.equal(200);
        expect(response.body.message).to.be.equal('Registro alterado com sucesso');
      })
    })
  })

  it('Should insert user when attempts to update an inexistent user id', () => {
    const user = userData.not_found.new_user;
    cy.deleteUser(user);
  
    cy.updateUser("123", user).should((response) => {
      expect(response.status).to.be.equal(201);
      expect(response.body.message).to.be.equal('Cadastro realizado com sucesso');
    })
  })

  it('Should not insert user when attempts to updated an inexistent user id but with registered email', () => {
    const user = userData.not_found.duplicated;
    cy.deleteUser(user);
    cy.insertUser(user).then((response) => {
      cy.updateUser("123", user).should((response) => {
        expect(response.status).to.be.equal(400);
        expect(response.body.message).to.be.equal('Este email já está sendo usado');
      })
    })
  })

  it('Should not update with invalid data', () => {
    const invalidData = userData.fail.invalid;
    cy.deleteUser(userData.fail.original);
    let id;
    cy.insertUser(userData.fail.original).then((response) => {
      id = response.body._id;
    });
    
    for(const data of invalidData){
      cy.updateUser(id, data).should((response) => {
        expect(response.status).to.be.equal(400);
      })
    }
  })
})

describe('DELETE /usuarios', () => {
  let userData;
  beforeEach(()=> {
    cy.fixture("user").then((data) => {
      userData = data.delete;
    });
  })

  it('Should successfully delete user', () => {
    const user = userData.success;
    cy.deleteUser(user);
    cy.insertUser(user).then((response) => {
      const id = response.body._id;
      cy.deleteUserById(id).should((response) => {
        expect(response.status).to.be.equal(200);
        expect(response.body.message).to.be.equal('Registro excluído com sucesso');
      })
    })
  })

  it('Should not delete when attempts to delete an inexistent id', () => {
    const user = userData.fail.not_found;
    cy.deleteUserById('123').should((response) => {
      expect(response.status).to.be.equal(200);
      expect(response.body.message).to.be.equal('Nenhum registro excluído');
    })
  })

  it('Should not delete when user has a cart', () => {
    const data = userData.fail.has_cart;
    const user = data.user;
    let token;
    cy.clearCartData();
    cy.insertUser(user);
    cy.login({
      "email": user.email,
      "password": user.password
    }).then((response) => {
      token = response.body.authorization;
      cy.deleteProduct(data.product, token);
      cy.insertProduct(data.product, token);
      cy.createCartWithItems(data.items, token);

      cy.deleteUser(data.user).should((response) => {
        expect(response.status).to.be.equal(400);
        expect(response.body).to.have.property('message', 'Não é permitido excluir usuário com carrinho cadastrado');
      })
    });
  })
})