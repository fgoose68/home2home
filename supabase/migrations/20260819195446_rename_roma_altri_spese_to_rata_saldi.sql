/*
# Rename Roma expense category to Rata saldi

1. Changes
- Update the expense category named `Altre spese` only for the apartment whose location is `Roma`.
- The category keeps the same ID, so all existing expenses remain linked to it.
- The category for Nettuno, if present, is not modified.

2. Data safety
- No rows are deleted.
- No columns, tables, relationships, or security policies are changed.

3. Important notes
- The update is limited by both the category name and the apartment location.
- Running this migration again has no effect after the rename.
*/

UPDATE expense_categories AS c
SET name = 'Rata saldi'
FROM apartments AS a
WHERE c.apartment_id = a.id
  AND a.location = 'Roma'
  AND c.name = 'Altre spese';