-- ============================================================
-- Migration: 新增帳本功能
-- 在 Supabase Dashboard > SQL Editor 貼上並執行
-- ============================================================

-- 1. 帳本資料表
create table if not exists public.ledgers (
  id uuid default gen_random_uuid() primary key,
  name text not null check (length(name) between 1 and 50),
  icon text not null default '💰',
  initial_balance numeric(10, 2) not null default 0 check (initial_balance >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- 2. 帳本轉帳記錄
create table if not exists public.ledger_transfers (
  id uuid default gen_random_uuid() primary key,
  from_ledger_id uuid not null references public.ledgers(id) on delete cascade,
  to_ledger_id uuid not null references public.ledgers(id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0 and amount <= 1000000),
  note text not null default '' check (length(note) <= 200),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  check (from_ledger_id <> to_ledger_id)
);

-- 3. transactions 補充欄位（若尚未存在）
alter table public.transactions
  add column if not exists ledger_id uuid references public.ledgers(id) on delete set null,
  add column if not exists type text not null default 'expense' check (type in ('expense', 'income'));

-- 4. categories 補充 type 欄位（若尚未存在）
alter table public.categories
  add column if not exists type text not null default 'expense' check (type in ('expense', 'income'));

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.ledgers enable row level security;
alter table public.ledger_transfers enable row level security;

-- ledgers：白名單成員可讀
create policy "ledgers_select" on public.ledgers
  for select using (public.is_family_member());

-- ledgers：白名單成員可新增
create policy "ledgers_insert" on public.ledgers
  for insert with check (
    public.is_family_member() and
    created_by = auth.uid()
  );

-- ledgers：只能修改自己建立的
create policy "ledgers_update" on public.ledgers
  for update using (
    public.is_family_member() and
    created_by = auth.uid()
  );

-- ledgers：只能刪除自己建立的
create policy "ledgers_delete" on public.ledgers
  for delete using (
    public.is_family_member() and
    created_by = auth.uid()
  );

-- ledger_transfers：白名單成員可讀
create policy "ledger_transfers_select" on public.ledger_transfers
  for select using (public.is_family_member());

-- ledger_transfers：白名單成員可新增
create policy "ledger_transfers_insert" on public.ledger_transfers
  for insert with check (
    public.is_family_member() and
    created_by = auth.uid()
  );
