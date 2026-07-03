#!/usr/bin/env bash
# ─────────────────────────────────────────────
#  H2H — Aggiornamento rapido (container attivo)
#  Uso: ./aggiorna.sh
# ─────────────────────────────────────────────
set -euo pipefail

echo ""
echo "  H2H — Aggiornamento in corso..."
echo "  ─────────────────────────────────"

# 1. Salva .env prima del reset (non e' su GitHub)
ENV_BACKUP=""
if [[ -f ".env" ]]; then
  ENV_BACKUP=$(cat .env)
  echo "  [1/4] .env salvato in memoria"
else
  echo "  [1/4] ATTENZIONE: .env non trovato, la build potrebbe fallire"
fi

# 2. Scarica ultime modifiche da GitHub (sovrascrive tutto il locale)
echo "  [2/4] Sincronizzazione con GitHub..."
git fetch origin
git reset --hard origin/main

# Ripristina .env dopo il reset
if [[ -n "$ENV_BACKUP" ]]; then
  echo "$ENV_BACKUP" > .env
  echo "  .env ripristinato"
fi

# Assicura che i file .sh siano eseguibili dopo il pull
chmod +x aggiorna.sh update.sh 2>/dev/null || true

# 3. Ricostruisce immagine e riavvia il container
echo "  [3/4] Build e riavvio container..."
docker compose down --remove-orphans
docker compose up -d --build

# 4. Mostra stato finale
echo "  [4/4] Stato container:"
docker compose ps

echo ""
echo "  Aggiornamento completato."
echo "  App disponibile su: http://localhost:3070"
echo ""
