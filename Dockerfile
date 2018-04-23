FROM node:9.11

# Folder for our application code
WORKDIR /usr/src/app

# Copy application
COPY . .

# Install dependencies and run build script
RUN yarn install --silent \
    && yarn build \
    && rm -rf node_modules \
    && yarn cache clean

# re-install local express so we can run the prod server
RUN npm install express --no-package-lock \
    && npm cache clean --force

# Expose port 8090 for express server
EXPOSE 8090

# Run production server
CMD ["yarn", "prod"]
