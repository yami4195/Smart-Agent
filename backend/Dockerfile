# 1. Base Image with Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# 2. Copy dependency definitions
COPY package*.json ./
COPY tsconfig.json ./

# 3. Install all dependencies (including devDependencies for TypeScript & Prisma CLI)
RUN npm install

# 4. Copy Prisma schema and generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# 5. Copy the source code and OpenAPI documentation
COPY src ./src
COPY openapi.yaml ./

# 6. Build TypeScript into JavaScript (dist folder)
RUN npm run build

# ==========================================
# Production Runtime Stage (Lean & Fast)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev

# Generate Prisma client for runtime
RUN npx prisma generate

# Copy built code & assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/openapi.yaml ./openapi.yaml

# Expose port 5000
EXPOSE 5000

# Start the server
CMD ["node", "dist/server.js"]