-- =========================================================================
-- AskMe AI — Migration 002: Add High-Performance Filter Indexes for Vectors
-- =========================================================================
-- These indexes are critical for multi-document scaling and sub-millisecond RAG.
-- =========================================================================

-- Create a B-tree composite index on document_id and user_id to avoid full table scans 
-- during matched vector filtering.
create index if not exists document_chunks_doc_user_idx
  on document_chunks (document_id, user_id);

-- Also add a standard index on profiles.xp to speed up leaderboard/HUD profiling updates
create index if not exists profiles_xp_idx
  on profiles (xp desc);
