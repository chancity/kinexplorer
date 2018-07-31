FROM node:8

# Create app directory
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --allow-unauthenticated xsel

# Copy all local files into the image.
COPY . .

RUN npm install

# Build for production.
RUN npm run build

# Install `serve` to run the application.
RUN npm install -g serve

# Set the command to start the node server.
CMD serve -s build -p 5000
