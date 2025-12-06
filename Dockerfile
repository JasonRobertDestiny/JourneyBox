# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build arguments for environment variables
ARG REACT_APP_DEEPWISDOM_API_KEY
ARG REACT_APP_DEEPWISDOM_BASE_URL=https://newapi.deepwisdom.ai/v1
ARG REACT_APP_DEEPWISDOM_MODEL=gpt-4o
ARG REACT_APP_UNSPLASH_ACCESS_KEY
ARG REACT_APP_AMAP_API_KEY
ARG REACT_APP_AMAP_SECURITY_KEY
ARG REACT_APP_AMAP_WEB_KEY

# Set environment variables for build
ENV REACT_APP_DEEPWISDOM_API_KEY=$REACT_APP_DEEPWISDOM_API_KEY
ENV REACT_APP_DEEPWISDOM_BASE_URL=$REACT_APP_DEEPWISDOM_BASE_URL
ENV REACT_APP_DEEPWISDOM_MODEL=$REACT_APP_DEEPWISDOM_MODEL
ENV REACT_APP_UNSPLASH_ACCESS_KEY=$REACT_APP_UNSPLASH_ACCESS_KEY
ENV REACT_APP_AMAP_API_KEY=$REACT_APP_AMAP_API_KEY
ENV REACT_APP_AMAP_SECURITY_KEY=$REACT_APP_AMAP_SECURITY_KEY
ENV REACT_APP_AMAP_WEB_KEY=$REACT_APP_AMAP_WEB_KEY

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
