-- 001_extensions.sql
-- Enable required extensions for the e‑commerce DB

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- Trigram index for fuzzy search
CREATE EXTENSION IF NOT EXISTS "citext";   -- Case‑insensitive text
