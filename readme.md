# Cypress E2E Testing Project for ServeRest API

This project is for studying the Cypress framework by performing end-to-end (E2E) testing on the [ServeRest API](https://serverest.dev/).

[![Badge ServeRest](https://img.shields.io/badge/API-ServeRest-green)](https://github.com/ServeRest/ServeRest/)

## Table of Content

- [Data Management](#data-management)
- [Runnig Locally](#running-locally)
- [Test Scenarios](#test-scenarios)
    - [Usuarios endpoint](#usuarios-endpoint)
    - [Produtos endpoint](#produtos-endpoint)
    - [Carrinhos endpoint](#carrinhos-endpoint)
- [Feedback and Questions](#feedback-and-questions)

## Data Management

The project utilizes a pre-defined dataset located in the fixtures directory for better control over test data. However, since the ServeRest API does not provide dedicated endpoints for deleting test data, the `reset.commands.js` file has been implemented. This file contains commands to clear the registered test data, ensuring a clean slate for each test run.

Benefits:

- Independent Test Runs: Each test run starts with a clean database, ensuring independence and preventing interference from previous tests.
- Efficient Debugging: Isolating issues becomes easier by eliminating the influence of leftover data from previous test executions.
- Reliable Test Results: By resetting the database before each test run, the results become more reliable and consistent.


## Running Locally

### Prerequisites 
- Node.js

### Getting Started
1. Clone this repository

    ```bash
    git clone https://github.com/ecureuill/serverest-cypress.git
    ```
1. Move to project directory
    ```bash
    cd serverest-cypress 
    ```
1. Install dependencies
    ```bash
    npm install
    ```
1. Start API server
    ```bash
    npx serverest@latetest
    ```
1. Run tests
    ```bash
    npm run test
    ```

Notes:
- **Restarting Serverest Doesn't Reset Database**: Be aware that simply restarting ServeRest with `npx serverest` won't clear the database. This is because npx caches packages for faster execution. To ensure a clean database for testing, follow these steps:
    1. Run `npx clear-npx-cache` to clear the npx cache.
    1. Then, reinstall ServeRest with `npx serverest`. This will reset the database as well.

- **Using cypress-plugin-api**:  This project utilized `cypress-plugin-api` during development. This plugin enhances the Cypress UI runner by displaying API information directly within the interface. If you intend to use the `cypress-plugin-api` plugin, replace all `cy.request()` calls with `cy.api()`. This will leverage the plugin's functionalities for a more informative testing experience.

## Test Scenarios
### Usuarios endpoint
Absolutely, here's the documentation for the test scenarios you provided:

#### GET /usuarios

This block tests functionalities related to retrieving user data through GET requests to the `/usuarios` endpoint.

**Scenarios:**
* **Should list 0 users:** This scenario verifies that the endpoint returns an empty list of users when no users exist in the database. It checks the response status code is 200, the `quantidade` property in the response body is 0, and the `usuarios` array is empty.
* **Should list all users:** This scenario tests that the endpoint returns a list of all users when some users are inserted beforehand. It verifies the response status code is 200 and the `quantidade` property in the response body matches the number of inserted users.
* **Should list users filtered by parameters:** This scenario tests that the endpoint can filter users based on provided parameters in the query string. It verifies the response status code is 200, the `quantidade` property in the response body is 1 (assuming filtering returns a single user), and the user data matches the filter criteria.
* **Should list user by id:** This scenario tests that the endpoint can retrieve a specific user by its ID. It performs a filtering by user data first to obtain the ID and then uses that ID in a separate request. The scenario verifies the response status code is 200 and the response body includes the user information matching the requested ID.

#### POST /usuarios

This block tests functionalities related to creating new users through POST requests to the `/usuarios` endpoint.

**Scenarios:**
* **Should successfully create an admin user:** This scenario tests that a request to create a new admin user with valid data is successful. It verifies the response status code is 201 and the response body contains a success message.
* **Should successfully create a not admin user:** This scenario tests that a request to create a new regular (not admin) user with valid data is successful. It verifies the response status code is 201 and the response body contains a success message.
* **Should not create a duplicated user:** This scenario tests that the endpoint prevents creating users with email addresses that already exist in the system. It verifies the response status code is 400 and the response body contains an error message about the email being already in use.
* **Should not create a user with invalid data:** This scenario tests that the endpoint rejects attempts to create users with invalid data in the request body. It iterates through an array of invalid user data configurations and verifies the response status code is 400 for each attempt.

#### PUT /usuarios

This block tests functionalities related to updating existing user data through PUT requests to the `/usuarios` endpoint.

**Scenarios:**
* **Should update successfully user data:** This scenario tests that a request to update an existing user's data with valid information is successful. It verifies the response status code is 200 and the response body contains a success message about the record being updated.
* **Should insert user when attempts to update an inexistent user id:** This scenario tests the behavior when updating a non-existent user. It verifies the endpoint creates a new user instead and returns a success message (code 201).
* **Should not insert user when attempts to updated an inexistent user id but with registered email:** This scenario ensures that attempting to update a non-existent user with an email address that already belongs to another user throws an error. It verifies the response status code is 400 and the response body contains an error message about the email being already in use.
* **Should not update with invalid data:** This scenario tests that the endpoint rejects attempts to update user data with invalid information in the request body. It iterates through an array of invalid user data configurations and verifies the response status code is 400 for each attempt.

#### DELETE /usuarios

This block tests functionalities related to deleting users through DELETE requests to the `/usuarios` endpoint.

**Scenarios:**
* **Should successfully delete user:** This scenario tests that a request to delete an existing user by its ID is successful. It verifies the response status code is 200 and the response body contains a success message about the record being deleted.
* **Should not delete when attempts to delete an inexistent id:** This scenario tests that attempting to delete a user with a non-existent ID doesn't result in an error. It verifies the response status code is 200 and the response body contains a message indicating no user was deleted.
* **Should not delete when user has a cart:** This scenario tests that the endpoint prevents deleting a user if they have an associated cart. It verifies the response status is 400 and the response body contains a error message indicating the user cannot be deleted due to the cart association.

### Produtos endpoint
#### GET /produtos

This block tests the functionalities related to retrieving product data through GET requests to the `/produtos` endpoint.

**Scenarios:**

* **Should list products:** This scenario verifies that the endpoint returns a list of products with a default count of two (configurable) when no filters are applied.
* **Should list products filtered by parameters:** This scenario tests that the endpoint can filter products based on provided parameters. It checks if the response contains only one product and its properties match the filter criteria.
* **Should find product by id:** This scenario ensures that the endpoint can retrieve a specific product by its ID. It verifies that the response status code is 200 and the response body contains the requested product information.

#### POST /produtos

**Description:** This block tests the functionalities related to creating new products through POST requests to the `/produtos` endpoint.

**Scenarios:**
* **Admin user**
    * **Should create product:** This scenario tests that an admin user with a valid token can successfully create a new product. It verifies the response status code is 201 and the response body contains a success message.
    * **Should not create product with invalid data:** This scenario checks that the endpoint rejects attempts to create products with invalid data. It verifies the response status code is 400 for each invalid product creation attempt.
    * **Should not create duplicated product:** This scenario ensures that the endpoint prevents creating products with duplicate names. It verifies the response status code is 400 and the response body contains an error message about the duplicate name.
* **Unathenticated user:** This scenario tests that users without a valid token cannot create products. It verifies the response status code is 401 and the response body contains an error message about missing or invalid authentication.
* **Regular user:** This scenario verifies that regular users (non-admins) cannot create products. It verifies the response status code is 403 and the response body contains an error message about insufficient permissions.

#### PUT /produtos

This block tests the functionalities related to updating existing products through PUT requests to the `/produtos` endpoint.

 **Scenarios:**
* **Admin user**
    * **Should update a product:** This scenario tests that an admin user can update an existing product's information. It verifies the response status code is 200 and the response body contains a success message.
    * **Should create a product when attempts to update with inexistent product id:** This scenario tests the behavior when updating a non-existent product. It verifies the endpoint creates a new product instead and returns a success message (code 201).
    * **Should not create a product when attempts to update with inexistent product id but with existent product name:** This scenario ensures that attempting to update a non-existent product with a name that already exists in another product throws an error. It verifies the response status code is 400 and the response body contains an error message about the duplicate name.
    * **Should not update a product with invalid data:** This scenario tests that the endpoint rejects attempts to update products with invalid data. It verifies the response status code is 400 for each invalid product update attempt.
* **Unauthenticated user:** This scenario tests that users without a valid token cannot update products. It verifies the response status code is 401 and the response body contains an error message about missing or invalid authentication.
* **Regular user:** This scenario verifies that regular users (non-admins) cannot update products. It verifies the response status code is 403 and the response body contains an error message about insufficient permissions.

#### DELETE /produtos

This block tests the functionalities related to deleting products through DELETE requests to the `/produtos` endpoint.

**Scenarios:**
* **Admin user**
    * **Should delete a product:** This scenario tests that an admin user can delete an existing product. It verifies the response status code is 200 and the response body contains a success message.
    * **Should not delete an inexistent product:** This scenario verifies that attempting to delete a non-existent product doesn't result in an error. It verifies the response status code is 200 and the response body contains a message indicating no product was deleted. 
    * **Should not delete a product linked to a cart:** This scenario tests that the endpoint prevents deleting a product if it is associated to a cart. It verifies the response status is 400 and the response body contains a error message indicating the product cannot be deleted due to the cart. 
* **Unauthenticated user:** This scenario tests that users without a valid token cannot delete products. It verifies the response status code is 401 and the response body contains an error message about missing or invalid authentication.
* **Regular user:** This scenario verifies that regular users (non-admins) cannot update products. It verifies the response status code is 403 and the response body contains an error message about insufficient permissions.

### Carrinhos endpoint

#### POST /carrinhos

This block tests the functionalities related to creating new carts through POST requests to `/carrinhos` endpoint.

**Scenarios:**

* **Should create a cart:** This scenario tests creating a new cart for a registered user with valid data. It verifies the response status code (201) and the response body contains a success message.
* **Should not create more than one cart:** This scenario tests creating a second cart for the same user. It verifies the response status code (400) and the response body contains an error message about not being allowed to have more than one cart.
* **Should not create a cart with a duplicated product:** This scenario tests creating a cart with a product already included in the cart. It verifies the response status code (400) and the response body contains an error message about duplicated products.
* **Should not create a cart with an inexistent product:** This scenario tests creating a cart with a product that doesn't exist in the database. It verifies the response status code (400) and the response body contains an error message about the product not being found.
* **Should not create a cart with an insufficient quantity of product:** This scenario tests creating a cart with a product quantity exceeding the available stock. It verifies the response status code (400) and the response body contains an error message about insufficient product quantity.
* **Should not create a cart with invalid data:** This scenario tests creating a cart with missing or invalid data in the request body. It iterates through an array of invalid data configurations and verifies the response status code (400) with specific error messages for each case.

#### GET /carrinhos

This block tests the functionalities related to retrieving cart data through GET requests to `/carrinhos` endpoint.

**Scenarios:**

* **Should list all carts:** This scenario tests retrieving all existing carts. It verifies the response status code (200), the presence of a `quantidade` property in the response body indicating the total number of carts, and the number of carts in the `carrinhos` array matches the total count.
* **Should filter carts:** This scenario tests filtering carts based on specific criteria provided in the query string. It iterates through different filter parameters and verifies the response status code (200), the `quantidade` property reflecting the filtered number of carts, and the presence of matching carts in the response body.
* **Should not filter carts with inexistent data:** This scenario tests filtering carts using non-existent filter criteria. It verifies the response status code (200), the `quantidade` property reflecting zero or the expected number of carts based on other filters, and an empty list of carts might be returned.
* **Should not filter carts with invalid data:** This scenario tests filtering carts with invalid data in the query string. It verifies the response status code (400) and the response body containing an error message about the invalid filter parameters.
* **Should find a cart by id:** This scenario tests retrieving a specific cart by its ID. It performs an initial filtering to obtain a cart ID and then uses that ID in a separate request. It verifies the response status code (200) and the response body containing the complete cart information matching the requested ID.

#### DELETE /carrinhos

This block tests the functionalities related to deleting carts through DELETE requests to `/carrinhos` endpoint.

**Scenarios:**

* **Should cancel a cart and return products to stock:** This scenario tests canceling an existing cart, verifying the product quantity is returned to the stock, and the cart is deleted. It verifies the response status code (200), a success message in the response body, and the product stock quantity is updated accordingly.
* **Should not cancel if user does not have a cart:** This scenario tests attempting to cancel a cart for a user who doesn't have an existing cart. It verifies the response status code (200) and the response body contains an error message about not finding a cart for the user.
* **Should checkout a cart:** This scenario tests checking out a cart, simulating a purchase completion. It verifies the product quantity is deducted from the stock, and the cart is deleted. It verifies the response status code (200), a success message in the response body, and the product stock quantity is updated accordingly.
* **Should not checkout if user does not have a cart:** This scenario tests attempting to checkout a cart for a user who doesn't have an existing cart. It verifies the response status code (200) and the response body contains an error message about not finding a cart for the user.
* **Should not cancel a cart without authorization token:** This scenario tests attempting to cancel a cart without providing a valid authorization token in the request header. It verifies the response status code (401) and the response body contains an error message about the missing, invalid, or expired authorization token.
* **Should not finish a cart without authorization token:** This scenario tests attempting to checkout a cart without providing a valid authorization token in the request header. It verifies the response status code (401) and the response body contains an error message about the missing, invalid, or expired authorization token.


# Feedback and Questions
I'm still learning test automation, so I'd appreciate your feedback and questions on this project. Your insights will help me improve my skills.