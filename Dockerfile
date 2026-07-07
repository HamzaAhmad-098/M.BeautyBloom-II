# =========== STAGE 1: Build Frontend (React/Vite) ===========
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files first for better caching
COPY client/package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --silent --no-optional

# Copy all client source code
COPY client/ ./

# Build the React app
RUN npm run build

# =========== STAGE 2: Build Backend (Node/Express) ===========
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# Copy package files first for better caching
COPY server/package*.json ./

# Install production dependencies only
RUN npm cache clean --force && \
    npm ci --only=production --silent

# Copy all server source code
COPY server/ ./

# =========== STAGE 3: Production Image ===========
FROM node:18-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Copy built frontend from stage 1
COPY --from=frontend-builder --chown=nodejs:nodejs /app/client/dist ./client/dist

# Copy backend from stage 2
COPY --from=backend-builder --chown=nodejs:nodejs /app/server ./server

# Set working directory to server
WORKDIR /app/server

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "src/server.js"]