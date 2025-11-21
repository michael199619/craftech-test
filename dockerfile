FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN rm -r src

COPY . .

CMD ["node", "dist/app.js"]