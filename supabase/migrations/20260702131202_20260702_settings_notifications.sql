/*
# Impostazioni notifiche Pushover + pg_cron

## Descrizione
Aggiunge il supporto alle notifiche push tramite Pushover per le spese in scadenza.
Il sistema invia automaticamente una notifica alle 9:15 (ora italiana estiva, 7:15 UTC)
il giorno della scadenza per ogni spesa con stato "Da pagare".

## Nuove tabelle
1. `settings` - Riga singola (id = 1) con la configurazione dell'applicazione
   - `pushover_user_key` (text, nullable) - Chiave utente Pushover
   - `pushover_api_token` (text, nullable) - Token API dell'app Pushover
   - `notifications_enabled` (boolean, default false) - Abilita/disabilita le notifiche
   - `updated_at` (timestamptz) - Ultima modifica

## Nuove funzioni
1. `send_due_expense_notifications()` - Funzione PL/pgSQL che:
   - Legge le credenziali da `settings`
   - Trova le spese con due_date = oggi e status = 'pending'
   - Per ciascuna invia una notifica HTTP POST a Pushover via pg_net

## Cron job
- Nome: `send-due-notifications`
- Schedule: `15 7 * * *` (7:15 UTC = 9:15 CEST ora italiana estiva)
- Chiama: `SELECT send_due_expense_notifications()`

## Estensioni abilitate
- `pg_cron` - Job scheduler PostgreSQL
- `pg_net` - HTTP client per PostgreSQL

## Sicurezza
- RLS abilitato su `settings`
- Policy TO anon, authenticated (app single-tenant senza autenticazione)
- USING(true): dati di configurazione condivisi dell'app

## Note importanti
1. L'orario 7:15 UTC corrisponde alle 9:15 ora italiana in estate (CEST, UTC+2).
   In inverno (CET, UTC+1) corrisponde alle 8:15 — modificare il cron a `15 8 * * *` in inverno.
2. Le notifiche vengono inviate solo se `notifications_enabled = true` e le credenziali sono configurate.
3. Il job pg_cron è idempotente: viene prima rimosso se esiste, poi ricreato.
*/

-- =====================
-- EXTENSIONS
-- =====================
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- =====================
-- SETTINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1,
  pushover_user_key text,
  pushover_api_token text,
  notifications_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "anon_delete_settings" ON settings FOR DELETE
  TO anon, authenticated USING (true);

-- =====================
-- NOTIFICATION FUNCTION
-- =====================
CREATE OR REPLACE FUNCTION send_due_expense_notifications()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_settings RECORD;
  v_expense  RECORD;
  v_message  text;
BEGIN
  SELECT * INTO v_settings FROM settings WHERE id = 1;

  IF NOT FOUND
     OR NOT v_settings.notifications_enabled
     OR v_settings.pushover_user_key IS NULL
     OR v_settings.pushover_api_token IS NULL
  THEN
    RETURN;
  END IF;

  FOR v_expense IN
    SELECT
      e.amount,
      e.period_label,
      a.name  AS apartment_name,
      ec.name AS category_name
    FROM expenses e
    JOIN apartments          a  ON a.id  = e.apartment_id
    JOIN expense_categories  ec ON ec.id = e.category_id
    WHERE e.due_date = CURRENT_DATE
      AND e.status   = 'pending'
  LOOP
    v_message := format(
      '%s · %s · €%s',
      v_expense.apartment_name,
      v_expense.category_name,
      to_char(v_expense.amount, 'FM999990.00')
    );

    IF v_expense.period_label IS NOT NULL THEN
      v_message := v_message || ' (' || v_expense.period_label || ')';
    END IF;

    PERFORM net.http_post(
      url     := 'https://api.pushover.net/1/messages.json',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := jsonb_build_object(
        'token',   v_settings.pushover_api_token,
        'user',    v_settings.pushover_user_key,
        'title',   'H2H - Scadenza oggi',
        'message', v_message
      )
    );
  END LOOP;
END;
$$;

-- =====================
-- CRON JOB (idempotente)
-- =====================
SELECT cron.unschedule('send-due-notifications') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-due-notifications'
);

SELECT cron.schedule(
  'send-due-notifications',
  '15 7 * * *',
  'SELECT send_due_expense_notifications()'
);
