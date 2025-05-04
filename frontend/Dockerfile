# Build stage
FROM node:slim as builder


# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE ${PORT:-3000}

# # Command to run the application
# CMD ["npm", "start"]
# Command to run the application - FIXED
CMD ["sh", "-c", "next start -p ${PORT:-3000}"]