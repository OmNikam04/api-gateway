FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install -g nodemon
EXPOSE 3002
CMD ["nodemon", "server.js"]
