/*
# Aggiorna orario notifiche: da 11:15 a 12:10 (ora italiana estiva)

## Modifica
- Aggiorna il cron job `send-due-notifications` da `15 9 * * *` a `10 10 * * *`
- 10:10 UTC = 12:10 CEST (UTC+2, ora italiana estiva)
- 10:10 UTC = 11:10 CET (UTC+1, ora italiana invernale)
*/

SELECT cron.unschedule('send-due-notifications')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-due-notifications'
);

SELECT cron.schedule(
  'send-due-notifications',
  '10 10 * * *',
  'SELECT send_due_expense_notifications()'
);
