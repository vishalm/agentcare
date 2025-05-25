-- PostgreSQL Extensions Initialization for AgentCare
-- This script sets up all necessary extensions for the AgentCare platform

-- Enable pgvector extension for vector similarity search (RAG system)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable extensions for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable crypto functions for security
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable JSONB functions
CREATE EXTENSION IF NOT EXISTS jsonb_plperl;

-- Enable time series functions
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Enable statistics extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Enable monitoring extensions
CREATE EXTENSION IF NOT EXISTS pg_buffercache;
CREATE EXTENSION IF NOT EXISTS pg_freespacemap;

-- Create vector index functions for RAG system
CREATE OR REPLACE FUNCTION create_vector_index(table_name TEXT, column_name TEXT, dimension INTEGER)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I_vector_idx ON %I USING ivfflat (%I vector_cosine_ops) WITH (lists = 100)', 
                   table_name || '_' || column_name, table_name, column_name);
END;
$$ LANGUAGE plpgsql;

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION vector_similarity_search(
    query_vector vector,
    table_name TEXT,
    column_name TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(id UUID, content TEXT, similarity FLOAT) AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT id, content, 1 - (%L <=> %I) as similarity 
         FROM %I 
         ORDER BY %L <=> %I 
         LIMIT %L',
        query_vector, column_name, table_name, query_vector, column_name, limit_count
    );
END;
$$ LANGUAGE plpgsql;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'AgentCare PostgreSQL extensions initialized successfully';
    RAISE NOTICE 'Available extensions: vector, pg_trgm, btree_gin, uuid-ossp, pgcrypto, timescaledb';
    RAISE NOTICE 'Vector dimension support: up to 16000 dimensions';
END $$; 