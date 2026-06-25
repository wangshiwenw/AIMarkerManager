# Marketing Frontend

Next.js 16 frontend for the AI market manager project.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand
- npm

This frontend currently has no login system. `/home` is the landing page, `/` redirects to `/home`, and the current repo demo is mounted through real App Router pages.

## Getting Started

```bash
npm install
cp env.example.txt .env.local
npm run dev
```

Open http://localhost:3000.

## Routes

- `/` - redirects to `/home`
- `/home` - 落地首页
- `/cockpit` - 操盘纵览
- `/plans` - 投放计划
- `/plans/planesDetail?step=0` - 创建投放计划 / 步骤页
- `/auth` - 授权管理
- `/materials` - 素材库
- `/leads` - 线索管理
- `/distribution` - 线索分发
- `/companies` - 装企承接

The demo shell is shared by `src/features/marketing-workbench/current-demo-shell.tsx`, while each route is mounted through App Router page files.

## Feature Structure

```text
src/features/marketing-workbench/
  current-demo-shell.tsx  Next.js shell for the current repo demo
  current-demo.css        styles ported from demo/css/styles.css
  index.ts                public feature export

public/current-demo/
  assets/                 assets copied from demo/assets
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
```

## Data

The current workbench uses demo data under `src/features/marketing-workbench/data/demo-data.json`, copied from `demo/js/data.js`.
To connect the Java backend later, replace that local data with API-backed feature modules.

## Docker

```bash
docker build -t marketing-frontend .
docker run -d -p 3000:3000 --name marketing-frontend marketing-frontend
```
