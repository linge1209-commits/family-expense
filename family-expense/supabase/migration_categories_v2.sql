-- ============================================================
-- Migration: 新增房貸、基金分類
-- 在 Supabase Dashboard > SQL Editor 貼上並執行
-- ============================================================

insert into public.categories (name, icon, type, sort_order) values
  ('房貸', '🏠', 'expense', 9),
  ('基金', '📈', 'expense', 10)
on conflict (name) do nothing;
