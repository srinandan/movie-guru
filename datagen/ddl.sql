CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS movies (
    tconst VARCHAR PRIMARY KEY,
    embedding VECTOR(768),
    title VARCHAR,
    runtime_mins INTEGER,
    genres VARCHAR,
    rating NUMERIC(3, 1),
    released INTEGER,
    actors VARCHAR,
    director VARCHAR,
    plot VARCHAR,
    poster VARCHAR,
    content VARCHAR
);

CREATE INDEX ON movies USING hnsw (embedding vector_cosine_ops);
