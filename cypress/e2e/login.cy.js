describe('POST /login', () => {

  let loginData;

  before(() => {
    cy.fixture("login").then((data) => {
      loginData = data;
      cy.insertUser(loginData.data.not_admin);
      cy.insertUser(loginData.data.admin);
    })
  })

  it('Should authenticate user', () => {
    cy.login(loginData.success.not_admin).should((response) => {
      expect(response.status).to.be.equal(200);
    })
  })

  it('Should authenticate admin user', () => {
    cy.login(loginData.success.admin).should((response) => {
      expect(response.status).to.be.equal(200);
    })
  })

  it('Should not authenticate with invalid credentials', ()=>{
    cy.login(loginData.fail).should((response) => {
      expect(response.status).to.be.equal(401);
      expect(response.body.message).to.be.equal('Email e/ou senha inválidos');
    })
  })

  it('Should not authenticate with invalid data', () => {
    for(const data of loginData.invalid){
      cy.login(data).should((response) => {
        expect(response.status).to.be.equal(400);
      })
    }
  })
})