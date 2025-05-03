FROM node:slim

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application
COPY . .

# Start the development server
CMD ["npm", "run", "dev"]