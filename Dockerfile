# ############################################################################
# Dockerfile for Fragments Microservice (Optimized Multi-Stage)
# ############################################################################

# Stage 0: Install dependencies
FROM node:22.12.0 AS dependencies

LABEL maintainer="Pranjal Surjan <psurjan@myseneca.ca>"
LABEL description="Fragments node.js microservice"

WORKDIR /app

# Copying package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for builds/tests)
RUN npm install

# ----------------------------------------------------------------------------

# Stage 1: Production Runtime
# Using a 'slim' image to reduce size and attack surface
FROM node:22.12.0-slim AS runtime

WORKDIR /app

# Copy only the installed node_modules from the dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy the source code and configuration
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd
COPY package.json ./

# Environment variables for the container
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
ENV NODE_ENV=production

# Documenting the port
EXPOSE 8080

# Defining the startup command
CMD ["npm", "start"]
