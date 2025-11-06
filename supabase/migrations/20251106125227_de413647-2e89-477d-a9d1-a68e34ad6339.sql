-- 创建全域排行榜表
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  kills INTEGER NOT NULL,
  waves INTEGER NOT NULL,
  accuracy DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 添加索引以提高查询性能
CREATE INDEX idx_leaderboard_score ON public.leaderboard(score DESC);

-- 启用RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取排行榜
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard
FOR SELECT
USING (true);

-- 允许插入新记录
CREATE POLICY "Anyone can insert to leaderboard"
ON public.leaderboard
FOR INSERT
WITH CHECK (true);