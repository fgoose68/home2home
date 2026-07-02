/*
# Aggiorna orario notifiche: da 9:15 a 11:15 (ora italiana estiva)

## Modifica
- Aggiorna il cron job `send-due-notifications` da `15 7 * * *` a `15 9 * * *`
- 9:15 UTC = 11:15 CEST (UTC+2, ora italiana estiva)
- 9:15 UTC = 10:15 CET (UTC+1, ora italiana invernale)
*/

SELECT cron.unschedule('send-due-notifications')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-due-notifications'
);

SELECT cron.schedule(
  'send-due-notifications',
  '15 9 * * *',
  'SELECT send_due_expense_notifications()'
);
