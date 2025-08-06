# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install curl for the health check
RUN apk add --no-cache curl

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the server runs on
EXPOSE 3000

# Specify the command to run the application
CMD [ "node", "build/index.js" ]