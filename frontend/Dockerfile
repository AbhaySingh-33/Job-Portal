FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1

# Accept build arguments for public variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AUTH_SERVICE
ARG NEXT_PUBLIC_USER_SERVICE
ARG NEXT_PUBLIC_JOB_SERVICE
ARG NEXT_PUBLIC_PAYMENT_SERVICE
ARG NEXT_PUBLIC_UTILS_SERVICE
ARG NEXT_PUBLIC_INTERVIEW_SERVICE
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG NEXT_PUBLIC_VAPI_WEB_TOKEN
ARG NEXT_PUBLIC_DEEPGRAM_API_KEY

# Set them as environment variables during build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AUTH_SERVICE=$NEXT_PUBLIC_AUTH_SERVICE
ENV NEXT_PUBLIC_USER_SERVICE=$NEXT_PUBLIC_USER_SERVICE
ENV NEXT_PUBLIC_JOB_SERVICE=$NEXT_PUBLIC_JOB_SERVICE
ENV NEXT_PUBLIC_PAYMENT_SERVICE=$NEXT_PUBLIC_PAYMENT_SERVICE
ENV NEXT_PUBLIC_UTILS_SERVICE=$NEXT_PUBLIC_UTILS_SERVICE
ENV NEXT_PUBLIC_INTERVIEW_SERVICE=$NEXT_PUBLIC_INTERVIEW_SERVICE
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_VAPI_WEB_TOKEN=$NEXT_PUBLIC_VAPI_WEB_TOKEN
ENV NEXT_PUBLIC_DEEPGRAM_API_KEY=$NEXT_PUBLIC_DEEPGRAM_API_KEY

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
