CREATE TABLE IF NOT EXISTS notes (
  id          TEXT PRIMARY KEY,
  title       TEXT,
  body_json   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  cited_refs  TEXT NOT NULL DEFAULT '[]',
  sermon_date TEXT,
  preacher    TEXT,
  location    TEXT,
  scripture   TEXT
);

CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);

CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  id UNINDEXED,
  title,
  body_text,
  cited_refs,
  tokenize='unicode61'
);

CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(id, title, body_text, cited_refs)
  VALUES (new.id, COALESCE(new.title,''), '', new.cited_refs);
END;

CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
  DELETE FROM notes_fts WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
  UPDATE notes_fts SET title = COALESCE(new.title,''), cited_refs = new.cited_refs
  WHERE id = new.id;
END;
