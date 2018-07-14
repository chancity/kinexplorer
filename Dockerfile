FROM node:8

# Create app directory
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --allow-unauthenticated xsel

# Copy all local files into the image.
COPY . .

RUN npm install

RUN ls

RUN rm node_modules/stellar-sdk/lib/call_builder.js
RUN wget https://raw.githubusercontent.com/chancity/kinexplorer/master/call_builder.js
RUN cp call_builder.js node_modules/stellar-sdk/lib/call_builder.js

# Build for production.
RUN npm run build

# Install `serve` to run the application.
RUN npm install -g serve

# Set the command to start the node server.
CMD serve -s build -p 5000