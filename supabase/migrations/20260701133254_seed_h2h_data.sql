/*
# H2H - Seed data: appartamenti e categorie di spesa

## Descrizione
Inserisce i dati iniziali: i due appartamenti (Roma e Nettuno) con le loro
categorie di spesa specifiche e i tipi di fatturazione configurati.

## Dati inseriti

### Appartamento Roma
- Condominio (mensile, 12/anno)
- TARI (quadrimestrale, 3 rate/anno: Apr/Ago/Dic)
- Energia/Luce (bimestrale, 6 bollette/anno)
- Gas (quadrimestrale, 3 bollette/anno: Apr/Ago/Dic - ogni 4 mesi)
- Acqua Potabile (bimestrale, 6 bollette/anno)
- Altre spese (libero)

### Appartamento Nettuno
- Condominio (trimestrale da marzo: Mar/Giu/Set/Dic)
- Energia (bimestrale, 6 bollette/anno)
- TARI (unica o trimestrale)
- Imposta sugli immobili IMU (2 rate: Giu/Dic)
- Altre spese (libero)

## Note
- INSERT ... ON CONFLICT DO NOTHING per idempotenza
- Usiamo valori fissi di UUID per garantire idempotenza
*/

-- Insert apartments (fixed UUIDs for idempotency)
INSERT INTO apartments (id, name, location, address, color_theme, icon)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Appartamento Roma', 'Roma', 'Roma, Italia', 'orange', 'building'),
  ('a2000000-0000-0000-0000-000000000002', 'Appartamento Nettuno', 'Nettuno', 'Nettuno (AN), Italia', 'blue', 'home')
ON CONFLICT (id) DO NOTHING;

-- Insert categories for Roma
INSERT INTO expense_categories (id, apartment_id, name, billing_type, color, icon, sort_order, notes)
VALUES
  ('c1100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Condominio', 'monthly', '#ea580c', 'building-2', 1, '12 rate mensili'),
  ('c1100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'TARI', 'tari_roma', '#d97706', 'trash-2', 2, '3 rate quadrimestrali (Apr/Ago/Dic)'),
  ('c1100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Energia / Luce', 'bimonthly', '#f59e0b', 'zap', 3, '6 bollette bimestrali'),
  ('c1100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Gas', 'four_monthly', '#fb923c', 'flame', 4, '3 bollette ogni 4 mesi'),
  ('c1100000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Acqua Potabile', 'bimonthly', '#38bdf8', 'droplets', 5, '6 bollette bimestrali'),
  ('c1100000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Altre spese', 'free', '#94a3b8', 'more-horizontal', 6, 'Spese varie non ricorrenti')
ON CONFLICT (id) DO NOTHING;

-- Insert categories for Nettuno
INSERT INTO expense_categories (id, apartment_id, name, billing_type, color, icon, sort_order, notes)
VALUES
  ('c2200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Condominio', 'quarterly_march', '#0891b2', 'building-2', 1, '4 rate trimestrali da marzo (Mar/Giu/Set/Dic)'),
  ('c2200000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'Energia', 'bimonthly', '#0284c7', 'zap', 2, '6 bollette bimestrali'),
  ('c2200000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', 'TARI', 'tari_nettuno', '#7c3aed', 'trash-2', 3, 'Unica oppure 3 rate trimestrali'),
  ('c2200000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000002', 'Imposta Immobili (IMU)', 'biannual', '#be185d', 'landmark', 4, '2 rate: acconto Giu / saldo Dic'),
  ('c2200000-0000-0000-0000-000000000005', 'a2000000-0000-0000-0000-000000000002', 'Altre spese', 'free', '#94a3b8', 'more-horizontal', 5, 'Spese varie non ricorrenti')
ON CONFLICT (id) DO NOTHING;
