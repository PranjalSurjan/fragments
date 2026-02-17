# ############################################################################
# Dockerfile for Fragments Microservice
# ############################################################################

# Matches your local node --version.
FROM node:24.12.0

# Metadata about the maintainer.
LABEL maintainer="Pranjal Surjan <psurjan@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Environment variables for the container.
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Setting the working directory.
WORKDIR /app

# Copying package files first for better caching.
COPY package*.json ./

# Installing dependencies.
RUN npm install

# Copying only the source code.
COPY ./src ./src

COPY ./tests/.htpasswd ./tests/.htpasswd

# Documenting the port.
EXPOSE 8080

# Defining the startup command.
CMD ["npm", "start"]
