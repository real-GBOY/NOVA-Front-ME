# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ------------------------------------------
# CRITICAL: Define Build Arguments
# ------------------------------------------
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_FIREBASE_VAPID_KEY
ARG VITE_API_BASE_URL

# ------------------------------------------
# Map ARGs to ENV variables for the build
# ------------------------------------------
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_FIREBASE_VAPID_KEY=$VITE_FIREBASE_VAPID_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy manifest files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build (Vite will now replace process.env vars with the values above)
RUN pnpm run build

# ==========================================
# Stage 2: Nginx Server
# ==========================================
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]