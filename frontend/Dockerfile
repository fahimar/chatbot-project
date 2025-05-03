# Build stage
FROM node:slim as builder

# Set working directory - this is critical!
WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY frontend/ ./

# Debug: Check directory structure
RUN ls -la
RUN find . -type d | sort

# Build the application
RUN npm run build

# Production stage
FROM node:slim

# Set working directory
WORKDIR /app/frontend

# Copy necessary files from build stage
COPY --from=builder /app/frontend/package*.json ./
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public

# Install production dependencies
RUN npm install --production

# Start the application
CMD ["npm", "start"]

# Expose the port Next.js runs on
EXPOSE 3000