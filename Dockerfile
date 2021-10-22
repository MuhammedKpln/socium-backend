FROM node:14 As development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:14-alpine As production
RUN apk update && apk upgrade && \
  apk add --no-cache bash git openssh alpine-sdk
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
COPY --from=development /usr/src/app/dist ./dist
EXPOSE 9009
CMD ["node", "dist/main"]