# H2H — Home2Home

Applicazione web per la gestione delle spese ricorrenti e dei documenti relativi a due appartamenti di proprietà: **Roma** e **Nettuno (RM)**.

## Funzionalità

- Registrazione e monitoraggio spese per appartamento e anno
- Classificazione per categoria (condominio, energia, TARI, gas, acqua, IMU, cedolare, ecc.)
- Tracciamento pagamenti effettuati e da effettuare
- Archivio documenti per appartamento e anno (PDF, immagini, Word, Excel)
- Statistiche comparative tra i due appartamenti
- Esportazione dati in CSV e PDF
- Backup e ripristino completo dei dati
- Notifiche push sulle scadenze tramite Pushover

## Tecnologie

| Componente | Tecnologia |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Supabase (PostgreSQL + Storage) |
| Autenticazione | Session storage locale |
| Deploy | Docker + Nginx |

## Deploy con Docker

```bash
# Build e avvio
docker compose up -d --build

# Accesso nel browser
# http://IP_SERVER:3070
```

Il file `.env` con le credenziali Supabase deve essere presente nella root del progetto.

## Aggiornamento su Ubuntu

```bash
cd ~/h2h && cp .env /tmp/.env.backup \
  && git fetch origin && git reset --hard origin/main \
  && cp /tmp/.env.backup .env

sudo docker compose up -d --build
```

## Documentazione

Per la guida completa all'uso vedere [`manuale_utente.md`](manuale_utente.md).

---

Ver. 20.3 — Agosto 2026
