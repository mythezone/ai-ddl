# Build stage
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Create nginx cache directories and set permissions
RUN mkdir -p /var/cache/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && mkdir -p /var/log/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && mkdir -p /var/lib/nginx \
    && chown -R nginx:nginx /var/lib/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid \
    && chown -R nginx:nginx /etc/nginx

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Update nginx configuration to run as non-root
RUN sed -i '/user  nginx;/d' /etc/nginx/nginx.conf \
    && sed -i 's,listen       80;,listen       7860;,' /etc/nginx/conf.d/default.conf \
    && sed -i '/user/d' /etc/nginx/nginx.conf \
    && chown -R nginx:nginx /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port 7860 (default for Hugging Face Spaces)
EXPOSE 7860

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 