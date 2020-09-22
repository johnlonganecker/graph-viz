FROM node:14.11

EXPOSE 6789

RUN mkdir -p /home/node/app/graph

COPY ./server/. /home/node/app/

WORKDIR /home/node/app

RUN npm install

CMD node /home/node/app/server.js
