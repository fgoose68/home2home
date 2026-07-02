#!/usr/bin/env bash
# ─────────────────────────────────────────────
#  H2H — Aggiornamento rapido (container attivo)
#  Uso: ./aggiorna.sh
# ─────────────────────────────────────────────
set -euo pipefail

echo ""
echo "  H2H — Aggiornamento in corso..."
echo "  ─────────────────────────────────"

# 1. Scarica ultime modifiche da GitHub
echo "  [1/3] git pull..."
git pull

# 2. Ricostruisce immagine e riavvia il container
echo "  [2/3] Build e riavvio container..."
sudo docker compose down --remove-orphans
sudo docker compose up -d --build

# 3. Mostra stato finale
echo "  [3/3] Stato container:"
sudo docker compose ps

echo ""
echo "  Aggiornamento completato."
echo "  App disponibile su: http://localhost:3070"
echo ""
