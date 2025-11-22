# Test for Craftech

# schema database

![Image alt](https://github.com/michael199619/craftech-test/raw/main/assets/database.png)
https://www.drawdb.app/editor?shareId=78fdadd1f52f9ece71c5cfa76822e175

# start

```bash
docker-compose up
```

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
