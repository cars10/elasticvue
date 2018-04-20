FROM node:9.11

# Folder for our application code
WORKDIR /usr/src/app

# Install dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --silent

# Copy application code
COPY . .

# Build production assets
RUN yarn build

# Remove dependencies to save space
RUN rm -rf node_modules

# re-install local express so we can run the prod server
RUN npm install express --no-package-lock

# Clean caches
RUN yarn cache clean
RUN npm cache clean --force

# Expose port 8090 for express server
EXPOSE 8090

# Run production server
CMD ["yarn", "prod"]
