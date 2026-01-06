FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start with ts-node directly (skip build)
CMD ["npx", "ts-node", "src/index.ts"]