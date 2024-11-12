# Fastify Boilerplate CLI
A simple CLI to create a structured Fastify project with pre-configured files and folders for rapid development.

## Features
- Generates a project boilerplate with Fastify as the web framework.
- Includes setup for plugins, routes, controllers, services, and models.
- Automatically updates package.json with the project name.
- Supports .env and .gitignore creation.
## Requirements
Node.js (version 12 or higher)

## Usage
To create a new Fastify project:

`fastify-boilerplate-cli create <project-name>`

Replace <project-name> with the desired name for your new project. This will:

1. Create a new directory with the given project name.
2. Copy all boilerplate files into the new directory.
3. Update package.json with the project name

This command will create a new folder named `<project-name>` with the following structure:
```
<project-name>/
├── src/
│   ├── plugins/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── utils/
│   ├── config/
│   ├── app.js
│   └── index.js
├── tests/
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Project Structure
- **src/**: Contains all application source code, structured by plugins, routes, controllers, services, and models.
  - **app.js**: Entry file for configuring Fastify and registering plugins and routes.
  - **config/**: Stores configuration files like database configuration.
  - **plugins/**: Custom Fastify plugins (e.g., authentication, database).
  - **routes/**: Route definitions and schema validations.
  - **controllers/**: Controllers for handling route logic.
  - **services/**: Service layer for business logic.
  - **models/**: Data models (if using an ORM).
  - **utils/**: Utility functions (e.g., logger, error handler).
- **tests/**: Contains all application tests.

## License
This project is licensed under the MIT License.