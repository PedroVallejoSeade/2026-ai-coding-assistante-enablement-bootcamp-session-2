# Coding Guidelines

This document outlines the coding style and quality principles for this project. Following these guidelines ensures consistency, maintainability, and high code quality across our full-stack JavaScript application.

## General Formatting Rules

### Code Style Consistency

We use standardized formatting conventions to maintain consistency across the codebase:

- **Indentation**: Use 2 spaces for indentation. Avoid tabs to ensure consistency across different editors and environments.
- **Line Length**: Keep lines reasonably short (prefer under 100 characters) to improve readability and reduce horizontal scrolling.
- **Semicolons**: Use semicolons at the end of statements for clarity and to prevent automatic semicolon insertion issues.
- **Quotes**: Use double quotes for strings consistently throughout the codebase (`"string"` rather than `'string'`).
- **Trailing Commas**: Include trailing commas in multiline arrays, objects, and function parameters to improve clarity in diffs and reduce merge conflicts.

### Naming Conventions

- **Variables and Functions**: Use `camelCase` naming convention (e.g., `getUserData`, `isActive`).
- **Constants**: Use `UPPER_SNAKE_CASE` for module-level constants (e.g., `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`).
- **React Components**: Use `PascalCase` for component names (e.g., `TodoList`, `UserProfile`).
- **File Names**: Use `kebab-case` for utility and component files (e.g., `todo-list.js`, `user-profile.js`), except for React components which should match their exported component name (e.g., `TodoList.js`).
- **Descriptive Names**: Choose clear, descriptive names that reflect the purpose of the variable, function, or component. Avoid single-letter variables except in obvious cases like loop counters.

### Whitespace and Formatting

- **Spacing Around Operators**: Add spaces around binary operators and after keywords (e.g., `if (condition)`, `x + y`).
- **Function Braces**: Place opening braces on the same line as the function declaration.
- **Blank Lines**: Use blank lines to separate logical sections of code and improve readability. Avoid multiple consecutive blank lines.

## Import Organization

Properly organized imports improve code readability and make dependencies explicit. Follow this import order:

1. **External Dependencies**: Import third-party packages first (e.g., `express`, `react`, `axios`).
2. **Internal Modules**: Import modules from your own project (e.g., `./utils`, `../config`).
3. **Relative Imports**: Use relative paths for local imports (e.g., `./components`, `../../services`).

### Import Best Practices

- **Group by Type**: Within each import category, group related imports together. Separate groups with blank lines.
- **Destructing**: Use destructuring for imports when importing multiple named exports to keep code concise.
- **Default vs Named Imports**: Use default imports for modules that export a single primary value, and named imports for modules with multiple exports.

### Example Import Organization

```javascript
// External dependencies
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Internal modules
const { getUserData, validateUser } = require('../services/userService');
const config = require('../config');

// Relative imports
const { formatDate } = require('./utils/dateFormatter');
```

## Linter Usage and Best Practices

### ESLint Configuration

This project uses ESLint to enforce coding standards and catch potential errors:

- **Frontend ESLint**: The frontend uses `react-app` and `react-app/jest` ESLint configurations, which enforce React and Jest best practices.
- **Backend**: The backend follows standard JavaScript linting rules through Jest configuration.

### Running Linting

To check for linting issues, ensure your IDE or editor is configured with ESLint support. Most issues should be caught automatically during development or revealed when running tests.

### Ignoring Linter Rules

Only ignore linter rules when absolutely necessary and always include a comment explaining why:

```javascript
// eslint-disable-next-line no-console
console.log('Debug information'); // This is intentional logging
```

Avoid using `eslint-disable` for entire files unless there's a specific reason documented at the top of the file.

## Code Quality Principles

### DRY (Don't Repeat Yourself)

The DRY principle emphasizes writing code that is not duplicated across your codebase:

- **Extract Common Logic**: When you find yourself writing similar code in multiple places, extract it into a shared utility function or service.
- **Reuse Components**: In React, create reusable components instead of duplicating similar UI elements. Use props to customize behavior.
- **Service Abstraction**: In the backend, abstract common database operations, API calls, or business logic into service modules.
- **Constants**: Store values that are used in multiple places in a constants file to avoid duplication and make updates easier.

Example of applying DRY:

```javascript
// Before: Duplicated logic
function getUserById() {
  try {
    // fetch user logic
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

function getPostById() {
  try {
    // fetch post logic
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// After: Reusable helper
function handleAsyncOperation(operation) {
  try {
    return operation();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

### SOLID Principles

SOLID principles promote maintainable, scalable, and testable code:

#### Single Responsibility Principle (SRP)

Each module, function, or component should have a single, well-defined responsibility. A function should do one thing and do it well:

```javascript
// Before: Multiple responsibilities
function processUserData(userData) {
  const validated = validateUser(userData);
  const api = new ApiClient();
  api.saveUser(validated);
  console.log('User saved');
  sendEmail(userData.email);
}

// After: Single responsibility
function validateAndSaveUser(userData) {
  const validated = validateUser(userData);
  saveUserToDatabase(validated);
}

function notifyUserAfterRegistration(email) {
  sendEmail(email);
}
```

#### Open/Closed Principle (OCP)

Code should be open for extension but closed for modification. Use composition and inheritance carefully:

```javascript
// Before: Hard to extend
function calculatePrice(item) {
  if (item.type === 'book') return item.price * 0.9;
  if (item.type === 'electronics') return item.price * 0.95;
}

// After: Open for extension, closed for modification
class PricingStrategy {
  calculate(price) {
    throw new Error('Must be implemented');
  }
}

class BookPricing extends PricingStrategy {
  calculate(price) {
    return price * 0.9;
  }
}

class ElectronicsPricing extends PricingStrategy {
  calculate(price) {
    return price * 0.95;
  }
}
```

#### Liskov Substitution Principle (LSP)

Derived classes should be substitutable for their base classes without breaking functionality. Ensure subclasses maintain the contract of their parent:

```javascript
// Use consistent interfaces and avoid surprising behavior in subclasses
class Animal {
  makeSound() {
    throw new Error('Must be implemented');
  }
}

class Dog extends Animal {
  makeSound() {
    return 'Woof';
  }
}

class Cat extends Animal {
  makeSound() {
    return 'Meow';
  }
}

// Both can be used interchangeably
function playSound(animal) {
  console.log(animal.makeSound());
}
```

#### Interface Segregation Principle (ISP)

Clients should not depend on interfaces they don't use. Create focused, specific interfaces:

```javascript
// Before: Fat interface
class User {
  login() {}
  logout() {}
  deploy() {}  // Not all users should have this
  reviewCode() {}  // Not all users should have this
}

// After: Segregated interfaces
class BasicUser {
  login() {}
  logout() {}
}

class AdminUser extends BasicUser {
  deploy() {}
  reviewCode() {}
}
```

#### Dependency Inversion Principle (DIP)

Depend on abstractions, not concrete implementations. This makes code more flexible and testable:

```javascript
// Before: Depends on concrete implementation
class UserService {
  constructor() {
    this.database = new MySQLDatabase();
  }
}

// After: Depends on abstraction
class UserService {
  constructor(database) {
    this.database = database;
  }
}

// Can now use different databases without changing UserService
const userService = new UserService(new MySQLDatabase());
// or
const userService = new UserService(new MongoDatabase());
```

## Testing and Code Quality

Write tests to verify your code works as expected:

- **Unit Tests**: Test individual functions and React components in isolation.
- **Integration Tests**: Test how different parts of your system work together.
- **Maintainable Tests**: Write clear, focused tests that verify specific behavior. Avoid test complexity that mirrors production complexity.

Well-written tests serve as documentation and catch regressions early.

## Summary

By following these coding guidelines, we ensure:

- **Consistency**: Everyone on the team follows the same patterns and conventions.
- **Maintainability**: Code is easy to understand, modify, and extend.
- **Quality**: Bugs are caught early through linting and testing.
- **Scalability**: Proper architecture using SOLID principles allows the codebase to grow without becoming unmanageable.

Remember that these guidelines are meant to improve code quality. When in doubt, prioritize readability and maintainability over strict adherence to rules.
