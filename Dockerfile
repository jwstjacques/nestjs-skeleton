# Build stage
FROM node:20.11.1-alpine3.19 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20.11.1-alpine3.19

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Create logs directory for application logging
RUN mkdir -p logs && chown -R nestjs:nodejs logs

# Copy package files
COPY package*.json ./

# Install production dependencies only
# Use --ignore-scripts to skip prepare scripts (husky) in Docker
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema for migrations
COPY prisma ./prisma

# Change ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Heap limit ~75% of container memory. Default 384MB assumes 512MB container.
# Override at deploy time via NODE_OPTIONS env var.
ENV NODE_OPTIONS="--max-old-space-size=384"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/src/main.js"]