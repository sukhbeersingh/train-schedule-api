# Base image
FROM node:19-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm install --production
RUN apk add --no-cache bash
ENV PATH="/app/node_modules/.bin:${PATH}"

# Build app
FROM dependencies AS build
COPY . .
RUN npm run build

# Production image
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY ./data/timetable.json /app/data/timetable.json 
EXPOSE 3000
CMD ["node", "./dist/index.js"]
