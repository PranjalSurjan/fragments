# Fragments

A back-end microservice for the Cloud Computing course. This project is a REST API built with Node.js and Express, designed to be scalable and cloud-ready.

## Project Overview

This repository contains the source code for the Fragments service. It focuses on implementing professional development standards, including structured logging, security middleware, and environment-based configurations.

## Getting Started

### Prerequisites

- **Node.js**: Active LTS version (**v20.6.0 or higher is required** for `--env-file` support).
- **WSL2 (for Windows)**: Use the Ubuntu/Linux terminal to ensure compatibility with Node.js binary dependencies.
- **Git**: Command line tool for version control and pushing to GitHub.

### Installation

1. Clone the repository using SSH (ensure your SSH keys are added to GitHub):

   ```bash
   git clone git@github.com:PranjalSurjan/fragments.git
   ```

2. Enter the project directory:

   ```bash

   cd fragments
   ```

3. Install the required dependencies:

   ```bash
   npm install
   ```

## Development Scripts

The following npm scripts are used to manage and run the application:

| Script | Command         | Description                                                                                             |
| -----: | --------------- | ------------------------------------------------------------------------------------------------------- |
|   lint | `npm run lint`  | Uses ESLint to check the `src/` directory for syntax errors and style issues.                           |
|  start | `npm start`     | Starts the server in standard production mode using `node src/server.js`.                               |
|    dev | `npm run dev`   | Starts the server with automatic restart (`--watch`) and loads environment variables from `.env.debug`. |
|  debug | `npm run debug` | Starts the server in watch mode and enables the Node inspector on port `9229` for VS Code debugging.    |

## Environment Variables

The application uses environment variables for configuration. Create a `.env.debug` file in the root directory to store these during development:

* `PORT`: The port the server listens on (default: `8080`).
* `FRAGMENTS_LOG_LEVEL`: Controls logging detail. Set to `debug` for development to see verbose logs, or `info` for standard operation.

## Testing the API

### Health Check Endpoint

To verify the server is running correctly, you can use `curl` or your browser.

**Standard Request:**

```bash
curl -i localhost:8080
```

**Formatted JSON Request (requires `jq` installed):**

```bash
curl -s localhost:8080 | jq
```

The response should include a `200 OK` status, your name as the author, and the current version of the project.

## Debugging in VS Code

This project includes a `.vscode/launch.json` file. To debug:

1. Open the **Run and Debug** view in VS Code (`Ctrl+Shift+D`).
2. Select **"Debug via npm run debug"** from the dropdown and press `F5`.
3. Set breakpoints in your code (e.g., `src/app.js`) to inspect variables and request flow.

## Author

* **Name:** Pranjal Surjan
* **GitHub:** [https://github.com/PranjalSurjan/fragments](https://github.com/PranjalSurjan/fragments)

## License

UNLICENSED




