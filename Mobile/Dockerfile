# ==========================================
# Phase 1: Build the React Native Web app
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first (optimizes Docker caching)
COPY package*.json ./
RUN npm install

# Copy project source code
COPY . .

# Build the static web bundle using Expo
# (Note: make sure public env variables are supplied if needed)
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

RUN npx expo export -p web

# ==========================================
# Phase 2: Serve the files using Nginx
# ==========================================
FROM nginx:alpine

# Copy the exported web assets from builder stage into Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]