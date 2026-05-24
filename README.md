# 🧩 Fragments Microservice

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-ECS%20%7C%20S3%20%7C%20DynamoDB-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-88%25%20Coverage-C21325?style=for-the-badge&logo=jest&logoColor=white)

A production-grade cloud microservice for storing, retrieving, and converting user content fragments — built with Node.js and deployed to AWS Elastic Container Service (ECS) via a fully automated CI/CD pipeline.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Supported Fragment Types](#-supported-fragment-types)
- [Type Conversions](#-type-conversions)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Running Tests](#-running-tests)
- [CI/CD Pipeline](#-cicd-pipeline)
- [AWS Infrastructure](#-aws-infrastructure)
- [Author](#-author)

---

## 🔍 Overview

Fragments is a RESTful microservice that allows authenticated users to create, read, update, delete, and convert fragments of data — including text, markdown, HTML, CSV, JSON, YAML, and images. The service is designed to demonstrate real-world cloud architecture patterns including:

- **Serverless container deployment** via AWS Fargate
- **Decoupled storage** using S3 (data) and DynamoDB (metadata)
- **Authentication** via Amazon Cognito JWT tokens
- **Automated CI/CD** with GitHub Actions
- **Integration testing** with LocalStack and DynamoDB Local

---

## 🧰 Tech Stack

| Tool | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **AWS S3** | Fragment data storage |
| **AWS DynamoDB** | Fragment metadata storage |
| **AWS ECS (Fargate)** | Serverless container hosting |
| **AWS ECR** | Docker image registry |
| **Amazon Cognito** | JWT-based user authentication |
| **Docker** | Containerization |
| **LocalStack** | Local S3 emulation for testing |
| **DynamoDB Local** | Local DynamoDB for testing |
| **Docker Compose** | Local development environment |
| **Hurl** | HTTP integration testing |
| **Jest** | Unit testing (88% coverage) |
| **GitHub Actions** | CI/CD automation |
| **sharp** | Image format conversion |
| **markdown-it** | Markdown to HTML conversion |
| **js-yaml** | JSON to YAML conversion |

---

## 🏗️ Architecture

```
                    ┌─────────────────────┐
                    │   fragments-ui      │
                    │   (React/Parcel)    │
                    └────────┬────────────┘
                             │ HTTP
                    ┌────────▼────────────┐
                    │  AWS Load Balancer  │
                    └────────┬────────────┘
                             │
                    ┌────────▼────────────┐
                    │   AWS ECS Fargate   │
                    │  (fragments API)    │
                    └──┬─────────────┬───┘
                       │             │
           ┌───────────▼──┐   ┌──────▼──────────┐
           │   AWS S3     │   │  AWS DynamoDB   │
           │ (data store) │   │ (metadata store)│
           └──────────────┘   └─────────────────┘
                       │
              ┌────────▼────────┐
              │  Amazon Cognito │
              │  (Auth / JWT)   │
              └─────────────────┘
```

Fragment data (binary/text) is stored in **S3** using the key format `ownerId/fragmentId`. Fragment metadata (type, size, timestamps) is stored in **DynamoDB** using a composite key of `ownerId` (partition) + `id` (sort).

---

## 📡 API Reference

All routes require authentication via `Authorization: Bearer <token>` (Cognito JWT) or HTTP Basic Auth (development).

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Health check — returns service info and version |
| `GET` | `/v1/fragments` | List all fragments for the authenticated user |
| `GET` | `/v1/fragments?expand=1` | List fragments with full metadata |
| `GET` | `/v1/fragments/:id` | Get raw fragment data |
| `GET` | `/v1/fragments/:id.ext` | Get fragment data converted to another format |
| `GET` | `/v1/fragments/:id/info` | Get fragment metadata |
| `GET` | `/v1/fragments/stats` | Get analytics stats for the user's fragments *(bonus)* |
| `POST` | `/v1/fragments` | Create a new fragment |
| `PUT` | `/v1/fragments/:id` | Update an existing fragment's data |
| `DELETE` | `/v1/fragments/:id` | Delete a fragment |

---

## 📄 Supported Fragment Types

| Type | MIME Type |
|---|---|
| Plain Text | `text/plain` |
| Markdown | `text/markdown` |
| HTML | `text/html` |
| CSV | `text/csv` |
| JSON | `application/json` |
| YAML | `application/yaml` |
| PNG Image | `image/png` |
| JPEG Image | `image/jpeg` |
| WebP Image | `image/webp` |
| GIF Image | `image/gif` |
| AVIF Image | `image/avif` |

---

## 🔄 Type Conversions

Fragments can be converted on-the-fly by appending a file extension to the GET request (e.g. `GET /v1/fragments/:id.html`):

| From | To |
|---|---|
| `text/markdown` | `.html`, `.txt` |
| `text/html` | `.txt` |
| `text/csv` | `.json`, `.txt` |
| `application/json` | `.yaml`, `.txt` |
| `application/yaml` | `.txt` |
| `image/*` | `.png`, `.jpeg`, `.webp`, `.gif`, `.avif` |

Image conversions are handled by the [sharp](https://sharp.pixelplumbing.com/) library.

---

## 📁 Project Structure

```
fragments/
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI: lint, unit tests, integration tests, Docker Hub push
│       └── cd.yml              # CD: build, push to ECR, deploy to ECS on git tag
│
├── src/
│   ├── app.js                  # Express app setup
│   ├── server.js               # Server entry point
│   ├── logger.js               # Pino structured logging
│   ├── hash.js                 # HMAC SHA256 user ID hashing
│   ├── response.js             # Standard success/error response helpers
│   ├── auth/
│   │   ├── index.js            # Auth strategy selector (Cognito or Basic)
│   │   ├── cognito.js          # AWS Cognito JWT validation
│   │   ├── basic-auth.js       # HTTP Basic Auth (development only)
│   │   └── auth-middleware.js  # Express auth middleware
│   ├── model/
│   │   ├── fragment.js         # Fragment class with validation and type conversion logic
│   │   └── data/
│   │       ├── index.js        # Switches between memory and AWS backends
│   │       ├── memory/         # In-memory storage (development)
│   │       └── aws/
│   │           ├── s3Client.js       # AWS S3 SDK client
│   │           ├── ddbDocClient.js   # AWS DynamoDB Document Client
│   │           └── index.js          # S3 + DynamoDB CRUD operations
│   └── routes/
│       ├── index.js            # Main router
│       └── api/
│           ├── index.js        # API router with rawBody middleware
│           ├── get.js          # GET /fragments
│           ├── getById.js      # GET /fragments/:id and type conversion
│           ├── getInfo.js      # GET /fragments/:id/info
│           ├── post.js         # POST /fragments
│           ├── put.js          # PUT /fragments/:id
│           ├── delete.js       # DELETE /fragments/:id
│           └── stats.js        # GET /fragments/stats (bonus analytics)
│
├── tests/
│   ├── unit/                   # Jest unit tests (45 tests, 88% coverage)
│   └── integration/            # Hurl integration tests
│       ├── health-check.hurl
│       ├── post-fragments.hurl
│       ├── lab-9-s3.hurl
│       ├── lab-10-dynamodb.hurl
│       └── assignment3.hurl
│
├── scripts/
│   └── local-aws-setup.sh      # Creates local S3 bucket and DynamoDB table
│
├── docker-compose.yml          # fragments + localstack + dynamodb-local
├── Dockerfile                  # Multi-stage production Docker image
├── fragments-definition.json   # ECS task definition
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop
- AWS CLI (configured)

### Local Development

```bash
# Clone the repo
git clone https://github.com/PranjalSurjan/fragments.git
cd fragments

# Install dependencies
npm install

# Copy environment file and fill in values
cp env.jest .env

# Start with local AWS services (LocalStack + DynamoDB Local)
docker compose up -d
./scripts/local-aws-setup.sh

# Start the server
npm start
```

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 8080) |
| `AWS_REGION` | AWS region |
| `AWS_S3_BUCKET_NAME` | S3 bucket for fragment data |
| `AWS_DYNAMODB_TABLE_NAME` | DynamoDB table for metadata |
| `AWS_COGNITO_POOL_ID` | Cognito user pool ID |
| `AWS_COGNITO_CLIENT_ID` | Cognito app client ID |
| `HTPASSWD_FILE` | Path to .htpasswd file (Basic Auth) |
| `FRAGMENTS_LOG_LEVEL` | Logging level (debug/info/warn) |

> When `AWS_REGION` is not set, the server automatically falls back to in-memory storage for local development.

---

## 🧪 Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage report
npm run coverage

# Integration tests (requires Docker containers running)
docker compose up -d
./scripts/local-aws-setup.sh
npm run test:integration

# Linting
npm run lint
```

### Test Coverage

```
All files    | 87.37% Stmts | 73.33% Branch | 86.95% Funcs | 88.11% Lines
```

45 tests across unit and integration suites covering all API routes, authentication, error cases, and type conversions.

---

## ⚙️ CI/CD Pipeline

### Continuous Integration (`ci.yml`)

Runs on every push and pull request to `main`:

```
ESLint → Dockerfile Lint → Unit Tests → Integration Tests → Push to Docker Hub
```

- Integration tests spin up **LocalStack** and **DynamoDB Local** via Docker Compose
- All 5 jobs must pass before pushing to Docker Hub

### Continuous Deployment (`cd.yml`)

Runs on every git tag (e.g. `v0.11.2`):

```
Build Docker Image → Push to Amazon ECR → Deploy to AWS ECS
```

- Uses `aws-actions/amazon-ecs-render-task-definition` to inject the new image
- Uses `aws-actions/amazon-ecs-deploy-task-definition` to update the ECS service

---

## ☁️ AWS Infrastructure

| Service | Usage |
|---|---|
| **ECS Fargate** | Serverless container hosting — no EC2 to manage |
| **ECR** | Private Docker image registry |
| **S3** | Fragment data stored as objects with `ownerId/id` key |
| **DynamoDB** | Fragment metadata with `ownerId` (partition) + `id` (sort) composite key |
| **ALB** | Application Load Balancer with stable DNS for the frontend |
| **Cognito** | User pool with hosted UI for authentication |
| **CloudWatch** | Container logs via `awslogs` driver |

---

## 👤 Author

**Pranjal Surjan**
📧 Pranjalsurjan03@gmail.com
🔗 [github.com/PranjalSurjan](https://github.com/PranjalSurjan)

---

> 💡 *Built as part of the Cloud Computing for Programmers (CCP555) course at Seneca Polytechnic, Winter 2026.*
