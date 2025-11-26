FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build
RUN rm -r src

COPY . .

CMD ["node", "dist/app.js"]