FROM node:12-alpine

RUN apk add --update --no-cache ffmpeg

WORKDIR /app

COPY package*.json ./

RUN npm ci --only production

COPY . .

CMD ["npm", "start"]
