FROM node:alpine
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Change second parameter if you move or rename bot.js
CMD ["node", "./src/bot.js"]