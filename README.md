# Test for Craftech

# Поведенческий анализ

https://www.figma.com/design/iWocx5v3ByzXghWqUTdkn7/Untitled?node-id=0-1&t=l958mi7G6f37r6SQ-1

# schema database

![Image alt](https://github.com/michael199619/craftech-test/raw/main/assets/database.svg)
https://www.drawdb.app/editor?shareId=78fdadd1f52f9ece71c5cfa76822e175

# start

```bash
cp .env.example .env
docker-compose up
```

swagger, если дев режим - http://localhost:8000/docs

ws - http://localhost:8000?board=UUID (для коннекта нужно войти в систему, тк нужны куки)

файл инсомнии здесь https://github.com/michael199619/craftech-test/blob/main/assets/insomia.yaml

# local development

## build

```bash
cp .env.example .env
npm i
```

## start

```bash
git config core.hooksPath .husky
docker-compose up postgres redis
npm run dev
```

## generate types of swagger

чтоб сгенерировать типы, нужен дев режим и включенный сваггер. openapi-typescript смотрит файл по адресу http://localhost:8000/docs.json

```bash
npm run types:gen
```
