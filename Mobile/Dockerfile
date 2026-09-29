# ==========================================
# Phase 1: Build the React Native Web app
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm install

# Copy source code and environment file
COPY . .

# Pass build arguments (with defaults from your .env if not passed)
ARG EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dG9wLXJhcHRvci0zMC5jbGVyay5hY2NvdW50cy5kZXYk
ARG EXPO_PUBLIC_API_URL=http://localhost:5000/api

ENV EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

# Build web distribution
RUN npx expo export -p web

# ==========================================
# Phase 2: Serve using Nginx
# ==========================================
FROM nginx:alpine

# Copy custom Nginx SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy exported assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]