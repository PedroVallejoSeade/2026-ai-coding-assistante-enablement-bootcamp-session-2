# Testing Guidelines

This document outlines the testing principles and standards for this project. All new features must include appropriate tests to ensure code quality, maintainability, and reliability.

## Unit Tests

Unit tests validate individual functions and React components in isolation using Jest.

### Naming Convention
- Use `*.test.js` or `*.test.ts` naming convention
- Name unit test files to match what they're testing (e.g., `app.test.js` for testing `app.js`)

### Directory Structure
- **Backend**: Place unit tests in `packages/backend/__tests__/` directory
- **Frontend**: Place unit tests in `packages/frontend/src/__tests__/` directory

### Best Practices
- Test individual functions and components in isolation
- Mock external dependencies
- Use descriptive test names that explain what is being tested
- Keep tests focused and concise

## Integration Tests

Integration tests validate backend API endpoints with real HTTP requests using Jest + Supertest.

### Naming Convention
- Use `*.test.js` or `*.test.ts` naming convention
- Name integration test files intelligently based on what they test (e.g., `todos-api.test.js` for TODO API endpoints)

### Directory Structure
- Place integration tests in `packages/backend/__tests__/integration/` directory

### Best Practices
- Test API endpoints with realistic HTTP requests
- Verify request/response handling and data flow
- Use setup and teardown hooks to initialize and clean up test data
- Test both success and error scenarios

## End-to-End (E2E) Tests

End-to-end tests validate complete UI workflows through browser automation using Playwright.

### Naming Convention
- Use `*.spec.js` or `*.spec.ts` naming convention
- Name E2E test files based on the user journey they test (e.g., `todo-workflow.spec.js`)

### Directory Structure
- Place E2E tests in `tests/e2e/` directory

### Best Practices
- Focus on critical user journeys and happy paths
- Test key edge cases for important features
- Limit E2E tests to 5-8 critical user journeys for maintainability
- Use the Page Object Model (POM) pattern for maintainability and reusability
- Use one browser only per test suite
- Each test should be independent and set up its own data
- Avoid relying on other tests or shared state

## Port Configuration

Always use environment variables with sensible defaults for port configuration to allow CI/CD workflows to dynamically detect ports.

### Backend
```javascript
const PORT = process.env.PORT || 3030;
```

### Frontend
React's default port is 3000, but can be overridden with the `PORT` environment variable.

## Test Isolation and Independence

- All tests must be isolated and independent
- Each test should set up its own data and not rely on other tests
- Setup and teardown hooks are required for proper test initialization and cleanup
- Tests must succeed on multiple runs without dependencies on execution order

## Playwright Requirements

- Playwright tests must use one browser only
- Playwright tests must implement the Page Object Model (POM) pattern for maintainability
- Test files should be organized logically within the `tests/e2e/` directory
- Create page objects to encapsulate selectors and common page interactions

## Coverage and Scope

### Unit and Integration Tests
- Aim for high coverage of business logic and critical paths
- Test edge cases and error scenarios
- Use meaningful assertions that clearly indicate what is being validated

### E2E Tests
- Focus on happy paths and key user journeys
- Test critical workflows that affect user experience
- Verify data persistence and state management across pages
- Avoid testing implementation details; focus on user-visible behavior

## General Best Practices

- **Maintainability**: Write tests that are easy to understand, maintain, and update
- **Performance**: Keep tests fast by mocking external services and limiting database queries
- **Clarity**: Use descriptive test names and comments for complex test logic
- **Consistency**: Follow the same patterns and conventions across all test files
- **Documentation**: Document any custom test utilities or complex test setups
- **CI/CD Integration**: Ensure all tests run successfully in automated pipelines
- **Regression Prevention**: Add tests when fixing bugs to prevent regression

## New Feature Requirements

All new features must include:
- Unit tests for business logic and components
- Integration tests for API endpoints (if applicable)
- E2E tests for critical user workflows (if applicable)
- Setup/teardown hooks to ensure test isolation
- Appropriate mock data and test fixtures
