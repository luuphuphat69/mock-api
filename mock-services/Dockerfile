FROM node:18-alpine

WORKDIR /mock-services

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]