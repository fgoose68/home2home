-- Add new expense categories: Cedolare + Spese extra for Roma, Spese extra for Nettuno

-- Roma: Cedolare
INSERT INTO expense_categories (id, apartment_id, name, billing_type, color, icon, sort_order, notes)
VALUES (
  'c1100000-0000-0000-0000-000000000007',
  'a1000000-0000-0000-0000-000000000001',
  'Cedolare',
  'biannual',
  '#16a34a',
  'file-text',
  7,
  '2 rate: acconto Giu / saldo Dic'
)
ON CONFLICT (id) DO NOTHING;

-- Roma: Spese extra
INSERT INTO expense_categories (id, apartment_id, name, billing_type, color, icon, sort_order, notes)
VALUES (
  'c1100000-0000-0000-0000-000000000008',
  'a1000000-0000-0000-0000-000000000001',
  'Spese extra',
  'free',
  '#64748b',
  'plus-circle',
  8,
  'Spese straordinarie non ricorrenti'
)
ON CONFLICT (id) DO NOTHING;

-- Nettuno: Spese extra
INSERT INTO expense_categories (id, apartment_id, name, billing_type, color, icon, sort_order, notes)
VALUES (
  'c2200000-0000-0000-0000-000000000006',
  'a2000000-0000-0000-0000-000000000002',
  'Spese extra',
  'free',
  '#64748b',
  'plus-circle',
  6,
  'Spese straordinarie non ricorrenti'
)
ON CONFLICT (id) DO NOTHING;
