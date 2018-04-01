FROM node:9-alpine


ENV NODE_ENV=production
COPY package.json ./
RUN yarn install

COPY index.js eg-client.js ./

CMD node index.js
