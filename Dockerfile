# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source files
COPY . .

# Create .env file from build arguments if provided
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_DEFAULT_LOCALE
ARG VITE_APP_VERSION
RUN if [ -n "$VITE_API_BASE_URL" ]; then \
    echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" >> .env; \
    fi && \
    if [ -n "$VITE_DEFAULT_LOCALE" ]; then \
    echo "VITE_DEFAULT_LOCALE=$VITE_DEFAULT_LOCALE" >> .env; \
    fi && \
    if [ -n "$VITE_APP_VERSION" ]; then \
    echo "VITE_APP_VERSION=$VITE_APP_VERSION" >> .env; \
    fi

# Build the application
RUN pnpm run build

# Production stage with Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from build stage
COPY --from=build /app/dist .

# Create a script to replace environment variables at runtime
RUN apk add --no-cache bash
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 5000

# Set entrypoint to allow environment variable replacement at runtime
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]