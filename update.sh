#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  H2H — Script di aggiornamento
#  Uso:  ./update.sh
#  Opz.: ./update.sh --no-pull   (build locale senza git pull)
# ─────────────────────────────────────────────────────────────
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

SKIP_PULL=false
for arg in "$@"; do
  [[ "$arg" == "--no-pull" ]] && SKIP_PULL=true
done

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║        H2H  —  Aggiornamento         ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# ── 0. Prerequisiti ───────────────────────────────────────────
for cmd in git docker; do
  if ! command -v "$cmd" &>/dev/null; then
    echo -e "${RED}ERRORE: '$cmd' non trovato. Installalo prima di continuare.${NC}"
    exit 1
  fi
done

# ── 1. Verifica .env ──────────────────────────────────────────
if [[ ! -f ".env" ]]; then
  echo -e "${RED}ERRORE: file .env non trovato nella cartella corrente.${NC}"
  echo "  Assicurati di eseguire lo script dalla radice del progetto."
  exit 1
fi
echo -e "${GREEN}✔ .env trovato${NC}"

# ── 2. Git pull ───────────────────────────────────────────────
if [[ "$SKIP_PULL" == false ]]; then
  echo -e "\n${YELLOW}▶ Scarico aggiornamenti da GitHub...${NC}"
  if git pull; then
    echo -e "${GREEN}✔ Repository aggiornato${NC}"
  else
    echo -e "${RED}ERRORE: git pull fallito. Verifica la connessione o i conflitti.${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠ --no-pull: git pull saltato${NC}"
fi

# ── 3. Build e riavvio container ──────────────────────────────
echo -e "\n${YELLOW}▶ Build e riavvio container Docker...${NC}"
docker compose up -d --build

echo -e "${GREEN}✔ Container avviato${NC}"

# ── 4. Verifica salute ────────────────────────────────────────
echo -e "\n${YELLOW}▶ Verifica stato container...${NC}"
sleep 3
docker compose ps

# ── 5. Ultimi log ─────────────────────────────────────────────
echo -e "\n${YELLOW}▶ Ultimi log (10 righe):${NC}"
docker compose logs --tail=10

echo -e "\n${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Aggiornamento completato!${NC}"
echo -e "${GREEN}  App disponibile su: http://localhost:3070${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}\n"
