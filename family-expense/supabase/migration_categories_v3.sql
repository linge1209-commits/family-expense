-- ============================================================
-- Migration: 新增旅遊、稅金分類
-- 在 Supabase Dashboard > SQL Editor 貼上並執行
-- ============================================================

insert into public.categories (name, icon, type, sort_order) values
  ('旅遊', '✈️', 'expense', 11),
  ('稅金', '🧾', 'expense', 12)
on conflict (name) do nothing;
