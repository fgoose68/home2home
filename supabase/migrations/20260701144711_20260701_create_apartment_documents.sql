/*
# Documenti appartamenti — storage bucket + tabella metadati

## Descrizione
Aggiunge la funzionalità di archiviazione documenti (contratti, fatture, planimetrie, ecc.)
per ciascun appartamento. I file vengono salvati su Supabase Storage nel bucket
`apartment-docs`; la tabella `apartment_documents` conserva i metadati.

## Nuove tabelle
1. `apartment_documents`
   - `id`           — chiave primaria UUID
   - `apartment_id` — FK verso `apartments`, CASCADE delete
   - `name`         — nome originale del file
   - `description`  — nota opzionale dell'utente
   - `storage_path` — percorso nel bucket Storage (`{apartment_id}/{uuid}_{filename}`)
   - `file_size`     — dimensione in byte
   - `mime_type`    — tipo MIME del file
   - `uploaded_at`  — timestamp di caricamento

## Storage
- Bucket `apartment-docs` (privato, limite 50 MB per file)
- Tipi MIME consentiti: PDF, immagini, Word, Excel, testo
- Policies su `storage.objects` per accesso anon + authenticated

## Sicurezza
- RLS abilitato
- Policies TO anon, authenticated (app single-tenant senza login Supabase)

## Note
1. Il bucket è privato: i file vengono serviti tramite URL firmati temporanei (signed URL).
2. Idempotente: usa IF NOT EXISTS / ON CONFLICT DO NOTHING / DROP POLICY IF EXISTS.
*/

-- ========================
-- STORAGE BUCKET
-- ========================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apartment-docs',
  'apartment-docs',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DROP POLICY IF EXISTS "anon_select_apt_docs_storage" ON storage.objects;
CREATE POLICY "anon_select_apt_docs_storage" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'apartment-docs');

DROP POLICY IF EXISTS "anon_insert_apt_docs_storage" ON storage.objects;
CREATE POLICY "anon_insert_apt_docs_storage" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'apartment-docs');

DROP POLICY IF EXISTS "anon_update_apt_docs_storage" ON storage.objects;
CREATE POLICY "anon_update_apt_docs_storage" ON storage.objects FOR UPDATE
  TO anon, authenticated USING (bucket_id = 'apartment-docs') WITH CHECK (bucket_id = 'apartment-docs');

DROP POLICY IF EXISTS "anon_delete_apt_docs_storage" ON storage.objects;
CREATE POLICY "anon_delete_apt_docs_storage" ON storage.objects FOR DELETE
  TO anon, authenticated USING (bucket_id = 'apartment-docs');

-- ========================
-- APARTMENT DOCUMENTS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS apartment_documents (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid        NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  name         text        NOT NULL,
  description  text,
  storage_path text        NOT NULL,
  file_size    bigint      NOT NULL CHECK (file_size > 0),
  mime_type    text        NOT NULL,
  uploaded_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apt_docs_apartment ON apartment_documents(apartment_id);
CREATE INDEX IF NOT EXISTS idx_apt_docs_uploaded  ON apartment_documents(uploaded_at DESC);

ALTER TABLE apartment_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_apt_docs" ON apartment_documents;
CREATE POLICY "anon_select_apt_docs" ON apartment_documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_apt_docs" ON apartment_documents;
CREATE POLICY "anon_insert_apt_docs" ON apartment_documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_apt_docs" ON apartment_documents;
CREATE POLICY "anon_update_apt_docs" ON apartment_documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_apt_docs" ON apartment_documents;
CREATE POLICY "anon_delete_apt_docs" ON apartment_documents FOR DELETE
  TO anon, authenticated USING (true);
