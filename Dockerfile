# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy source code
COPY . .

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Build Backend
RUN npm run build

# Return to root to build Frontend
WORKDIR /app
RUN npm run build

# Expose the API port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
