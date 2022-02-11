# build env
FROM node:14-alpine as build

WORKDIR /app

RUN apk add --no-cache git
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --non-interactive && yarn cache clean
COPY . .
RUN yarn typechain && yarn build

# final image
FROM node:14-alpine as base

WORKDIR /app

COPY --from=build /app /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s \
  CMD node healthcheck.js

CMD ["yarn", "start"]