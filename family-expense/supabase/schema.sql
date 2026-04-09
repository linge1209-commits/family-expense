-- ============================================================
-- 家庭記帳本 Schema
-- 在 Supabase Dashboard > SQL Editor 貼上並執行
-- ============================================================

-- 1. 家庭成員白名單（只有這裡的 email 才能登入）
create table public.family_members (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  display_name text not null,
  created_at timestamptz default now()
);

-- 2. 消費分類
create table public.categories (
  id serial primary key,
  name text not null unique,
  icon text not null default '📦',
  monthly_budget numeric(10, 2),
  sort_order integer default 0
);

-- 3. 交易記錄
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date,
  amount numeric(10, 2) not null check (amount > 0 and amount <= 1000000),
  category_id integer references public.categories(id) on delete set null,
  description text not null check (
    length(description) <= 200 and
    description not like '=%'    -- 防止 Formula Injection
  ),
  payer text not null check (length(payer) <= 50),
  added_by uuid references auth.users(id) on delete set null,
  added_by_email text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. 月份預算覆寫（可覆蓋 categories.monthly_budget）
create table public.monthly_budgets (
  id serial primary key,
  year integer not null,
  month integer not null check (month between 1 and 12),
  category_id integer references public.categories(id) on delete cascade,
  budget numeric(10, 2) not null check (budget >= 0),
  unique(year, month, category_id)
);

-- ============================================================
-- Row Level Security（核心資安設定）
-- ============================================================

alter table public.family_members enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.monthly_budgets enable row level security;

-- 輔助函數：檢查目前登入者是否在白名單
create or replace function public.is_family_member()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.family_members
    where email = (select email from auth.users where id = auth.uid())
  );
$$;

-- family_members：只有白名單成員可以讀，不可自行新增/刪除
create policy "family_members_select" on public.family_members
  for select using (public.is_family_member());

-- categories：白名單成員可讀
create policy "categories_select" on public.categories
  for select using (public.is_family_member());

-- categories：白名單成員可新增/修改（管理員功能）
create policy "categories_insert" on public.categories
  for insert with check (public.is_family_member());

create policy "categories_update" on public.categories
  for update using (public.is_family_member());

-- transactions：白名單成員可讀所有記錄
create policy "transactions_select" on public.transactions
  for select using (public.is_family_member());

-- transactions：白名單成員可新增（added_by 必須是自己）
create policy "transactions_insert" on public.transactions
  for insert with check (
    public.is_family_member() and
    added_by = auth.uid()
  );

-- transactions：只能修改自己新增的記錄
create policy "transactions_update" on public.transactions
  for update using (
    public.is_family_member() and
    added_by = auth.uid()
  );

-- transactions：只能刪除自己新增的記錄
create policy "transactions_delete" on public.transactions
  for delete using (
    public.is_family_member() and
    added_by = auth.uid()
  );

-- monthly_budgets：白名單成員可讀寫
create policy "budgets_select" on public.monthly_budgets
  for select using (public.is_family_member());

create policy "budgets_insert" on public.monthly_budgets
  for insert with check (public.is_family_member());

create policy "budgets_update" on public.monthly_budgets
  for update using (public.is_family_member());

-- ============================================================
-- updated_at 自動更新 trigger
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 預設分類資料
-- ============================================================

insert into public.categories (name, icon, monthly_budget, sort_order) values
  ('餐飲', '🍽️', 15000, 1),
  ('交通', '🚗', 5000, 2),
  ('購物', '🛍️', 10000, 3),
  ('娛樂', '🎮', 3000, 4),
  ('醫療', '🏥', 5000, 5),
  ('教育', '📚', 5000, 6),
  ('水電瓦斯', '💡', 3000, 7),
  ('其他', '📦', 5000, 8);
