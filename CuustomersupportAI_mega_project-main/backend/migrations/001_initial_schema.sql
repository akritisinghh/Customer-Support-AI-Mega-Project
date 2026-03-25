-- ============================================================
-- AI Customer Support Copilot — Initial Schema Migration
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- Enable pgvector for embeddings (run once)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Enums ──────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE channel_enum AS ENUM ('chat','email','whatsapp','sms','slack','teams','voice','video');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sender_type_enum AS ENUM ('customer','agent','system','ai');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status_enum AS ENUM ('open','pending','resolved','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE priority_enum AS ENUM ('low','medium','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE document_status_enum AS ENUM ('pending','processing','ready','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('admin','agent','viewer','api');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE agent_status_enum AS ENUM ('available','busy','offline');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tenants ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  settings    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Insert a default tenant for local development
INSERT INTO tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Org', 'default')
ON CONFLICT (slug) DO NOTHING;

-- ── Users ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  display_name   TEXT DEFAULT '',
  role           TEXT DEFAULT 'viewer',
  metadata       JSONB DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ── Agents ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  display_name  TEXT DEFAULT '',
  status        TEXT DEFAULT 'offline',
  skills        JSONB DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agents_tenant ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- ── Customers ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  external_id   TEXT,
  email         TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  display_name  TEXT DEFAULT '',
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(tenant_id, email);

-- ── Conversations ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id       UUID REFERENCES customers(id) ON DELETE CASCADE,
  channel           TEXT DEFAULT 'chat',
  status            TEXT DEFAULT 'open',
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  metadata          JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  closed_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(tenant_id, channel);

-- ── Messages ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id  UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type      TEXT DEFAULT 'customer',
  sender_id        UUID,
  channel          TEXT DEFAULT 'chat',
  content          TEXT NOT NULL DEFAULT '',
  content_type     TEXT DEFAULT 'text',
  metadata         JSONB DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_tenant ON messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ── Tickets ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id   UUID REFERENCES conversations(id) ON DELETE SET NULL,
  customer_id       UUID REFERENCES customers(id) ON DELETE CASCADE,
  subject           TEXT DEFAULT '',
  status            TEXT DEFAULT 'open',
  priority          TEXT DEFAULT 'medium',
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  sla_due_at        TIMESTAMPTZ,
  summary           TEXT,
  tags              JSONB DEFAULT '[]'::jsonb,
  metadata          JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  closed_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(tenant_id, priority);

-- ── Ticket Messages (join table) ──────────────────────────

CREATE TABLE IF NOT EXISTS ticket_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID REFERENCES tickets(id) ON DELETE CASCADE,
  message_id  UUID REFERENCES messages(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ticket_id, message_id)
);

-- ── Knowledge Documents ────────────────────────────────────

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT '',
  source_type  TEXT DEFAULT 'upload',
  source_ref   TEXT DEFAULT '',
  status       TEXT DEFAULT 'pending',
  version      INT DEFAULT 1,
  metadata     JSONB DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kb_docs_tenant ON knowledge_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_status ON knowledge_documents(tenant_id, status);

-- ── Knowledge Chunks (for RAG vector search) ──────────────

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  document_id   UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  content       TEXT NOT NULL DEFAULT '',
  embedding     vector(1536),
  chunk_index   INT DEFAULT 0,
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_chunks_doc ON knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_tenant ON knowledge_chunks(tenant_id);

-- ── Voice Calls ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS voice_calls (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id  UUID REFERENCES conversations(id) ON DELETE SET NULL,
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL,
  agent_id         UUID REFERENCES agents(id) ON DELETE SET NULL,
  external_id      TEXT,
  recording_url    TEXT,
  transcript       TEXT,
  summary          TEXT,
  duration_seconds INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now(),
  ended_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_voice_calls_tenant ON voice_calls(tenant_id);

-- ── API Keys ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT '',
  key_hash     TEXT NOT NULL,
  scopes       JSONB DEFAULT '[]'::jsonb,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- ── Integrations Config ────────────────────────────────────

CREATE TABLE IF NOT EXISTS integrations_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL DEFAULT '',
  config      JSONB DEFAULT '{}'::jsonb,
  enabled     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integrations_tenant ON integrations_config(tenant_id);

-- ── Audit Logs ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID REFERENCES tenants(id) ON DELETE CASCADE,
  actor_id       UUID,
  action         TEXT NOT NULL DEFAULT '',
  resource_type  TEXT DEFAULT '',
  resource_id    TEXT DEFAULT '',
  details        JSONB DEFAULT '{}'::jsonb,
  ip             TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ── Vector Search Function (for RAG) ──────────────────────

CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  p_tenant_id      UUID,
  p_query_embedding vector(1536),
  p_match_count    INT DEFAULT 5,
  p_match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id          UUID,
  tenant_id   UUID,
  document_id UUID,
  content     TEXT,
  metadata    JSONB,
  similarity  FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.tenant_id,
    kc.document_id,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> p_query_embedding) AS similarity
  FROM knowledge_chunks kc
  WHERE kc.tenant_id = p_tenant_id
    AND 1 - (kc.embedding <=> p_query_embedding) > p_match_threshold
  ORDER BY kc.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- ── Disable RLS for development (enable in production) ────
-- In production, enable RLS on all tenant-scoped tables and
-- add policies that filter by tenant_id from the JWT.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations_config ENABLE ROW LEVEL SECURITY;

-- Allow anon/authenticated roles full access for development
-- (Replace with proper policies in production)

CREATE POLICY "allow_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_agents" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_kb_docs" ON knowledge_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_kb_chunks" ON knowledge_chunks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_voice_calls" ON voice_calls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_api_keys" ON api_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_integrations" ON integrations_config FOR ALL USING (true) WITH CHECK (true);
