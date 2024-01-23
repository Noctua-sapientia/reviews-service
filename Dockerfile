FROM node:14-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY bin/ ./bin
COPY public ./public
COPY routes/ ./routes
COPY services/ ./services
COPY models/ ./models
COPY middlewares/ ./middlewares
COPY app.js .
COPY db.js .

EXPOSE 4004

CMD npm start
