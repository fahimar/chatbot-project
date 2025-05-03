# Build stage
FROM node:slim as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the frontend directory content
COPY . ./

# Create a pages directory at the root level with content from src/pages
# This is the key fix - much simpler than symbolic links
RUN mkdir -p pages && cp -r src/pages/* pages/

# Debug: Show the directory structure to verify pages are correctly set up
RUN ls -la && echo "Pages directory:" && ls -la pages

# Copy next.config.js to ensure it's available
RUN cp next.config.js ./

# Build the application
RUN npm run build

# Production stage
FROM node:slim

# Set working directory
WORKDIR /app

# Copy necessary files from build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/pages ./pages

# Install production dependencies
RUN npm install --production

# Start the application
CMD ["npm", "start"]

# Expose the port Next.js runs on
EXPOSE 3000