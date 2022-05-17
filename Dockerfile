FROM node:lts

WORKDIR /usr/src/app
COPY . .

RUN npm install
RUN npm run build

RUN mkdir -p /usr/src/app/build/tmp

WORKDIR /usr/src/app/build

RUN npm set-script prepare ""
RUN npm install --production

EXPOSE ${PORT}

CMD ["node", "server.js"]
