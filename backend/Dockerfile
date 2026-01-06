FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for tsx)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start with tsx directly (which is already installed)
CMD ["npx", "tsx", "src/index.ts"]