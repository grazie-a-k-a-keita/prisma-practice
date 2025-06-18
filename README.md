## prisma-practice

### コマンド一覧

```bash
# Node 初期化
bun init -y

# パッケージインストール
bun add typescript tsx @types/node --save-dev
bun add prisma --save-dev

# Prisma 初期化
bunx prisma init --datasource-provider sqlite --output ../generated/prisma
bunx prisma migrate dev --name init

# bun add @prisma/client

# シード
bunx prisma db seed

# データベースをリセット（開発のみ）
npx prisma migrate reset
```

### jwt

```
Bearer { jwtToken }
```
