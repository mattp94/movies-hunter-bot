FROM node:12-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only production

COPY . .

CMD ["npm", "start"]
