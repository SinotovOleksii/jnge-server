# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy local files instead of cloning from Git
COPY . .

# Install dependencies
RUN npm install

# Start the script
CMD ["node", "main.mjs"]
