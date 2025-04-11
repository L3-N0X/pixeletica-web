# Build stage
FROM node:23-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM devforth/spa-to-http:latest
COPY --from=build /app/build /app