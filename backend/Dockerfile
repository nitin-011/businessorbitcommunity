FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
# Install production dependencies only
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# We do not copy .env in Dockerfile; env vars should be provided at runtime
EXPOSE 8001

CMD ["npm", "start"]
