-- Add doc_year column to apartment_documents
ALTER TABLE apartment_documents
  ADD COLUMN IF NOT EXISTS doc_year integer NOT NULL DEFAULT EXTRACT(year FROM now())::integer;

CREATE INDEX IF NOT EXISTS idx_apt_docs_year ON apartment_documents(doc_year);

-- Fix wrong province code: Nettuno is in Roma (RM), not Ancona (AN)
UPDATE apartments
SET address = 'Nettuno (RM), Italia'
WHERE location = 'Nettuno' AND address LIKE '%AN%';
