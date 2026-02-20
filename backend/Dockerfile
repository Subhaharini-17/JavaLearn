FROM node:20-bullseye

# Install Java properly
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk && \
    apt-get clean

# Set Java environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy remaining files
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]
