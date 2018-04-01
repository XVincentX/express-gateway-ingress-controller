FROM node:9


ENV NODE_ENV=production
COPY package.json ./
RUN yarn install

COPY index.js egClient.js ./

CMD node index.js
