# Application for Annual Clothing Allowance

## URL
http://localhost:3001/disability/eligibility/annual-clothing-allowance/apply-form-10-8678/
https://staging.va.gov/disability/eligibility/annual-clothing-allowance/apply-form-10-8678/

## Common commands
```bash
# Development
yarn watch --env entry=10-8678
yarn watch --env entry=10-8678,auth,static-pages,login-page,verify,profile

# Mock API
yarn mock-api --responses src/applications/benefits-optimization-pingwind/10-8678/tests/fixtures/mocks/local-mock-responses.js

# Unit tests
yarn test:unit --app-folder benefits-optimization-pingwind/10-8678
yarn test:unit --app-folder benefits-optimization-pingwind/10-8678 --log-level all

# E2E tests
yarn cy:open
yarn cy:run --spec "src/applications/benefits-optimization-pingwind/10-8678/tests/e2e/10-8678.cypress.spec.js"
```