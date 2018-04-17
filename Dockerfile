FROM node:9.11

# Folder for our application code
WORKDIR /usr/src/app

# Install dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

# Copy application code
COPY . .

# Build production assets
RUN yarn build

# Expose port 8090 for express server
EXPOSE 8090

# Run production server
CMD ["yarn", "prod"]
