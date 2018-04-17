FROM node:9.11

# Folder for our application code
WORKDIR /usr/src/app

# Install dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

# Copy application code
COPY . .

# Expose port 8090 for webpack-dev-server
EXPOSE 8090

# Run dev server
CMD ["yarn", "start"]
