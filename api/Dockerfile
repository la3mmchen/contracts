# Multi-stage build for optimized image size
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Create data directory
RUN mkdir -p data && chown nextjs:nodejs data

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "dist/index.js"] 