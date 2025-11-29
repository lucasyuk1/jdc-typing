
-- Run this in Supabase SQL Editor (enable pgcrypto extension if needed)
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  username text unique,
  name text,
  idade int,
  turma text,
  password_hash text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  wpm int,
  accuracy int,
  erros int,
  palavras int,
  tempo_segundos int,
  created_at timestamptz default now()
);

create index if not exists idx_results_wpm on results (wpm desc);
