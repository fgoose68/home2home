/*
# H2H - Home2Home: Schema principale

## Descrizione
Crea le tabelle fondamentali per la gestione delle spese di due appartamenti
(Roma e Nettuno). Nessuna autenticazione richiesta: accesso pubblico (admin unico).

## Nuove tabelle
1. `apartments` - I due appartamenti gestiti
   - id, name, location, address, color_theme, icon, created_at

2. `expense_categories` - Voci di spesa per appartamento
   - id, apartment_id (FK), name, billing_type, color, icon, sort_order, notes

3. `expenses` - Le spese inserite
   - id, apartment_id (FK), category_id (FK)
   - amount, description, expense_date, due_date
   - year, period_label, status ('pending' | 'paid')
   - created_at, updated_at

## Sicurezza
- RLS abilitato su tutte le tabelle
- Policies TO anon, authenticated con USING(true): dati condivisi/pubblici (app single-tenant senza login)

## Note importanti
1. App single-tenant: nessun user_id, nessun auth.uid()
2. Tutti i dati sono accessibili tramite chiave anonima
3. Migrations idempotenti con IF NOT EXISTS / DROP POLICY IF EXISTS
*/

-- =====================
-- APARTMENTS
-- =====================
CREATE TABLE IF NOT EXISTS apartments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  address text,
  color_theme text NOT NULL DEFAULT 'orange',
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_apartments" ON apartments;
CREATE POLICY "anon_select_apartments" ON apartments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_apartments" ON apartments;
CREATE POLICY "anon_insert_apartments" ON apartments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_apartments" ON apartments;
CREATE POLICY "anon_update_apartments" ON apartments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_apartments" ON apartments;
CREATE POLICY "anon_delete_apartments" ON apartments FOR DELETE
  TO anon, authenticated USING (true);

-- =====================
-- EXPENSE CATEGORIES
-- =====================
CREATE TABLE IF NOT EXISTS expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  name text NOT NULL,
  billing_type text NOT NULL DEFAULT 'free',
  color text NOT NULL DEFAULT '#6b7280',
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_categories_apartment ON expense_categories(apartment_id);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_expense_categories" ON expense_categories;
CREATE POLICY "anon_select_expense_categories" ON expense_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_expense_categories" ON expense_categories;
CREATE POLICY "anon_insert_expense_categories" ON expense_categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_expense_categories" ON expense_categories;
CREATE POLICY "anon_update_expense_categories" ON expense_categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_expense_categories" ON expense_categories;
CREATE POLICY "anon_delete_expense_categories" ON expense_categories FOR DELETE
  TO anon, authenticated USING (true);

-- =====================
-- EXPENSES
-- =====================
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  description text,
  expense_date date NOT NULL,
  due_date date,
  year integer NOT NULL,
  period_label text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_apartment ON expenses(apartment_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_year ON expenses(year);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE
  TO anon, authenticated USING (true);
