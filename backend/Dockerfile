FROM node:20

# Install Java
RUN apt-get update && apt-get install -y openjdk-17-jdk

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]