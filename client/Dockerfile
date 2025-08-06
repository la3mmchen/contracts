# Multi-stage build for optimized image size
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies with legacy peer deps to resolve conflicts
RUN rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps && \
    npm cache clean --force

# Build the application - use regular node image for build to avoid Alpine Rollup issues
FROM node:18 AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install in builder stage to ensure correct binaries
RUN rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps

# Copy source code
COPY . .

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM nginx:alpine AS runner
# Install curl for health checks
RUN apk add --no-cache curl
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/dist .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 80

# Use entrypoint script
ENTRYPOINT ["/entrypoint.sh"] 