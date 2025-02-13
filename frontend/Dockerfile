# ---- Build Stage ----
FROM node:lts-alpine AS builder

WORKDIR /app

# Copy package files first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Pass Firebase env variables at build time
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_GCP_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDERID
ARG VITE_FIREBASE_APPID
ARG VITE_CHAT_SERVER_URL

# Set env variables (available at runtime)
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_GCP_PROJECT_ID=$VITE_GCP_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDERID=$VITE_FIREBASE_MESSAGING_SENDERID
ENV VITE_FIREBASE_APPID=$VITE_FIREBASE_APPID
ENV VITE_CHAT_SERVER_URL=$VITE_CHAT_SERVER_URL
# Build the Vite app
RUN npm run build

# ---- Serve Stage ----
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=builder /app/dist .

# Copy custom nginx config
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 4000

CMD ["nginx", "-g", "daemon off;"]
