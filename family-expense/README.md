# YJ 家庭記帳本

家庭共用記帳 PWA，支援多帳本、收支管理、月報表。

**線上版本：** https://family-expense-steel.vercel.app

---

## 功能

- **收支記錄** — 支出／收入切換，分類、付款人、帳本、日期、說明
- **多帳本** — 建立多個帳本（家庭公費、旅遊基金⋯），追蹤各帳本餘額
- **帳本轉帳** — 帳本間互相調撥金額
- **月份明細** — 依月份篩選所有交易，顯示收入／支出／淨額
- **報表分析** — 分類佔比圓餅圖、近 6 個月趨勢、本月分類排行
- **家庭白名單** — 只有管理員加入的 email 才能登入，防止外人存取
- **PWA** — 可安裝至手機主畫面，支援離線頁面

---

## 技術架構

| 項目 | 技術 |
|------|------|
| Framework | Next.js 16 (App Router) |
| 資料庫 | Supabase (PostgreSQL + RLS) |
| 認證 | Supabase Auth（Email/Password）|
| 樣式 | Tailwind CSS v4 |
| 圖表 | Recharts |
| 部署 | Vercel |

---

## 本機開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 建立環境變數

複製 `.env.example` 為 `.env.local`，填入 Supabase 設定：

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 建立資料庫

在 **Supabase Dashboard → SQL Editor** 依序執行：

```
supabase/schema.sql
```

再執行 ledger 相關 migration：

```sql
-- 帳本
create table public.ledgers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon text not null default '💰',
  initial_balance numeric(10, 2) not null default 0 check (initial_balance >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.ledgers enable row level security;
create policy "ledgers_select" on public.ledgers for select using (public.is_family_member());
create policy "ledgers_insert" on public.ledgers for insert with check (public.is_family_member() and created_by = auth.uid());
create policy "ledgers_update" on public.ledgers for update using (public.is_family_member());
create policy "ledgers_delete" on public.ledgers for delete using (public.is_family_member() and created_by = auth.uid());

-- 帳本轉帳
create table public.ledger_transfers (
  id uuid default gen_random_uuid() primary key,
  from_ledger_id uuid not null references public.ledgers(id) on delete cascade,
  to_ledger_id uuid not null references public.ledgers(id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  note text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  constraint different_ledgers check (from_ledger_id <> to_ledger_id)
);
alter table public.ledger_transfers enable row level security;
create policy "transfers_select" on public.ledger_transfers for select using (public.is_family_member());
create policy "transfers_insert" on public.ledger_transfers for insert with check (public.is_family_member() and created_by = auth.uid());
create policy "transfers_delete" on public.ledger_transfers for delete using (public.is_family_member() and created_by = auth.uid());

-- 交易加入 ledger_id
alter table public.transactions add column ledger_id uuid references public.ledgers(id) on delete set null;

-- 收支類型
alter table public.categories add column if not exists type text not null default 'expense' check (type in ('expense', 'income'));
alter table public.transactions add column if not exists type text not null default 'expense' check (type in ('expense', 'income'));

-- 預設收入分類
insert into public.categories (name, icon, monthly_budget, sort_order, type) values
  ('薪資', '💼', null, 1, 'income'),
  ('獎金', '🎁', null, 2, 'income'),
  ('投資', '📈', null, 3, 'income'),
  ('其他收入', '💹', null, 4, 'income');

-- description 改為非必填
alter table public.transactions alter column description set default '';
alter table public.transactions alter column description drop not null;
```

### 4. 新增家庭成員

```sql
insert into public.family_members (email, display_name) values
  ('your@email.com', '你的名字');
```

在 **Supabase Dashboard → Authentication → Users → Add user** 建立對應帳號。

### 5. 啟動開發伺服器

```bash
npm run dev
```

開啟 http://localhost:3000

---

## 部署

已設定 Vercel 自動部署。push 至 `main` 分支後自動觸發。

**Vercel 環境變數：**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Supabase URL Configuration：**
- Site URL: `https://family-expense-steel.vercel.app`

---

## 專案結構

```
src/
├── app/
│   ├── (app)/          # 需登入的頁面
│   │   ├── dashboard/  # 首頁
│   │   ├── add/        # 新增收支
│   │   ├── history/    # 明細
│   │   ├── ledgers/    # 帳本管理
│   │   └── reports/    # 報表
│   ├── login/          # 登入頁
│   ├── offline/        # 離線頁
│   └── manifest.ts     # PWA manifest
├── actions/            # Server Actions
│   ├── auth.ts
│   ├── transactions.ts
│   ├── categories.ts
│   └── ledgers.ts
├── components/
│   ├── transactions/   # 交易相關元件
│   └── ui/             # 通用 UI
└── lib/
    └── supabase/       # Supabase client & types
```

---

## 安全設計

- **Row Level Security (RLS)** — 所有資料表啟用 RLS，僅白名單成員可存取
- **家庭成員白名單** — middleware 每次請求驗證白名單，非成員自動登出
- **Formula Injection 防禦** — 描述欄位過濾 `=+-@\t\r` 開頭字元
- **CSP Headers** — production 環境移除 `unsafe-eval`
- **HSTS** — 強制 HTTPS
