-- ===========================================
-- AskMe AI — Database Schema
-- ===========================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor
-- ===========================================

-- Enable pgvector extension for semantic search
create extension if not exists vector;

-- ===========================================
-- PROFILES (extends Supabase auth.users)
-- ===========================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  grade text,
  exam_goal text,
  study_pace text default 'calibrated',
  ai_personality text default 'socratic',
  cognitive_profile jsonb default '{
    "conceptual": 50,
    "retention": 50,
    "analytical": 50,
    "discipline": 50,
    "consistency": 50,
    "adaptability": 50,
    "calibration": 50,
    "efficiency": 50,
    "archetype": "New Learner",
    "description": "Your cognitive profile will evolve as you study, take quizzes, and interact with the AI tutor."
  }'::jsonb,
  xp int default 0,
  streak int default 0,
  last_active_date text,
  created_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Student'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auto profile creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===========================================
-- DOCUMENTS
-- ===========================================
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  file_url text,
  file_size text,
  extracted_text text,
  summary jsonb,
  created_at timestamptz default now()
);

-- ===========================================
-- DOCUMENT CHUNKS (for RAG / vector search)
-- ===========================================
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  chunk_index int,
  content text,
  embedding vector(768),
  metadata jsonb,
  created_at timestamptz default now()
);

-- Create an index for fast vector similarity search
create index if not exists document_chunks_embedding_idx
  on document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ===========================================
-- VECTOR SIMILARITY SEARCH FUNCTION
-- ===========================================
create or replace function match_document_chunks(
  query_embedding vector(768),
  match_count int default 5,
  filter_document_id uuid default null,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where (filter_document_id is null or dc.document_id = filter_document_id)
    and (filter_user_id is null or dc.user_id = filter_user_id)
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ===========================================
-- QUIZZES
-- ===========================================
create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  title text,
  questions jsonb not null,
  created_at timestamptz default now()
);

-- ===========================================
-- QUIZ ATTEMPTS
-- ===========================================
create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade not null,
  document_id uuid references documents(id),
  answers jsonb,
  score int,
  total_questions int,
  correct_count int,
  weak_topics jsonb,
  revision_plan jsonb,
  created_at timestamptz default now()
);

-- ===========================================
-- CHAT MESSAGES
-- ===========================================
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  sender text check (sender in ('user', 'ai')) not null,
  content text not null,
  sources jsonb,
  created_at timestamptz default now()
);

-- ===========================================
-- PLANNER ITEMS
-- ===========================================
create table if not exists planner_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  date text,
  duration int default 20,
  is_urgent boolean default false,
  completed boolean default false,
  created_at timestamptz default now()
);

-- ===========================================
-- MEMORY GRAPH NODES
-- ===========================================
create table if not exists graph_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  label text not null,
  strength int default 50,
  status text default 'learning',
  x float,
  y float,
  created_at timestamptz default now()
);

-- ===========================================
-- MEMORY GRAPH LINKS
-- ===========================================
create table if not exists graph_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  source_node uuid references graph_nodes(id) on delete cascade not null,
  target_node uuid references graph_nodes(id) on delete cascade not null
);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================
alter table profiles enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table quizzes enable row level security;
alter table quiz_attempts enable row level security;
alter table chat_messages enable row level security;
alter table planner_items enable row level security;
alter table graph_nodes enable row level security;
alter table graph_links enable row level security;

-- Users can only access their own data
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can manage own documents" on documents for all using (auth.uid() = user_id);
create policy "Users can manage own chunks" on document_chunks for all using (auth.uid() = user_id);
create policy "Users can manage own quizzes" on quizzes for all using (auth.uid() = user_id);
create policy "Users can manage own attempts" on quiz_attempts for all using (auth.uid() = user_id);
create policy "Users can manage own messages" on chat_messages for all using (auth.uid() = user_id);
create policy "Users can manage own planner" on planner_items for all using (auth.uid() = user_id);
create policy "Users can manage own nodes" on graph_nodes for all using (auth.uid() = user_id);
create policy "Users can manage own links" on graph_links for all using (auth.uid() = user_id);
