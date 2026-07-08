# H2H — Home2Home
## Manuale Utente · Ver. 8.1 · Luglio 2026

---

## Indice

1. [Introduzione](#1-introduzione)
2. [Accesso all'applicazione](#2-accesso-allapplicazione)
3. [Dashboard — Riepilogo generale](#3-dashboard--riepilogo-generale)
4. [Appartamento Roma](#4-appartamento-roma)
5. [Appartamento Nettuno](#5-appartamento-nettuno)
6. [Gestione spese](#6-gestione-spese)
7. [Statistiche](#7-statistiche)
8. [Documenti](#8-documenti)
9. [Backup & Ripristino](#9-backup--ripristino)
10. [Impostazioni & Notifiche](#10-impostazioni--notifiche)
11. [Navigazione e layout](#11-navigazione-e-layout)

---

## 1. Introduzione

**H2H — Home2Home** è un'applicazione web per la gestione delle spese ricorrenti e dei documenti relativi a due appartamenti di proprietà: **Appartamento Roma** e **Appartamento Nettuno (RM)**.

L'applicazione consente di:
- Registrare e monitorare tutte le spese per appartamento e anno
- Classificare le spese per categoria (bollette, condominio, tasse, ecc.)
- Tenere traccia dei pagamenti effettuati e di quelli ancora da effettuare
- Archiviare documenti (contratti, bollette, planimetrie, ecc.) per appartamento e anno
- Visualizzare statistiche comparative tra i due appartamenti
- Esportare i dati in formato CSV o PDF
- Effettuare il backup completo dei dati e ripristinarli

Tutti i dati sono salvati in cloud su **Supabase** e rimangono disponibili da qualsiasi dispositivo.

---

## 2. Accesso all'applicazione

### Schermata di login

All'avvio dell'applicazione viene mostrata la schermata di accesso.

| Campo | Valore |
|---|---|
| **Utente** | `fabrizio` |
| **Password** | `brizio1968` |

Premere **Accedi** o il tasto Invio per entrare.

> La sessione rimane attiva finché si rimane sul browser. Chiudendo e riaprendo la scheda è necessario effettuare nuovamente l'accesso.

### Logout

Per uscire dall'applicazione premere l'icona di logout nella barra di navigazione in alto a destra.

---

## 3. Dashboard — Riepilogo generale

La Dashboard è la pagina principale, accessibile tramite l'icona Home nella navigazione.

### Cosa mostra

**Riquadro riepilogo (in alto)**
- Totale spese anno corrente (somma Roma + Nettuno)
- Totale già pagato (verde)
- Totale ancora da pagare (giallo)

**Quattro card riassuntive**
- Roma — Totale anno corrente
- Nettuno — Totale anno corrente
- Spese pagate (numero fatture)
- Da pagare (numero fatture)

**Card accesso rapido appartamenti**
- Clic sulla card Roma apre direttamente la pagina Appartamento Roma
- Clic sulla card Nettuno apre direttamente la pagina Appartamento Nettuno

**Grafico a barre**
- Confronto spese per categoria nell'anno corrente (tutte le categorie di entrambi gli appartamenti)

**Tabella dettaglio categorie**
- Importo per categoria con barra proporzionale

**Ultime spese registrate**
- Le 5 spese più recenti con categoria, appartamento, importo e stato pagamento

---

## 4. Appartamento Roma

Accessibile dalla navigazione → **Roma** oppure dalla Dashboard.

### Categorie di spesa configurate

| Categoria | Cadenza | Note |
|---|---|---|
| Condominio | Mensile | 12 rate all'anno |
| TARI | Quadrimestrale | 3 rate: Aprile / Agosto / Dicembre |
| Energia / Luce | Bimestrale | 6 bollette all'anno |
| Gas | Ogni 4 mesi | 3 bollette all'anno |
| Acqua Potabile | Bimestrale | 6 bollette all'anno |
| Cedolare | Semestrale | 2 rate: acconto Giugno / saldo Dicembre |
| Spese extra | Libero | Spese straordinarie non ricorrenti |
| Altre spese | Libero | Spese non ricorrenti |

### Intestazione pagina

- Nome e indirizzo appartamento
- Totale anno selezionato / Pagato / Da pagare (aggiornati in tempo reale con i filtri)

### Card categorie (filtro rapido)

Cliccando su una card categoria si filtra la lista mostrando solo quelle spese. Un secondo clic rimuove il filtro.

---

## 5. Appartamento Nettuno

Stesso layout dell'Appartamento Roma, con le proprie categorie.

### Categorie di spesa configurate

| Categoria | Cadenza | Note |
|---|---|---|
| Condominio | Trimestrale da Marzo | 4 rate: Mar / Giu / Set / Dic |
| Energia | Bimestrale | 6 bollette all'anno |
| TARI | Unica o trimestrale | |
| Imposta Immobili (IMU) | Semestrale | 2 rate: acconto Giugno / saldo Dicembre |
| Spese extra | Libero | Spese straordinarie non ricorrenti |
| Altre spese | Libero | Spese non ricorrenti |

---

## 6. Gestione spese

### Aggiungere una spesa

1. Aprire la pagina dell'appartamento (Roma o Nettuno)
2. Premere **+ Aggiungi spesa** in alto a destra
3. Nel modulo compilare:
   - **Categoria** — selezionare dalla lista
   - **Anno** — anno di competenza della spesa
   - **Importo** — in euro (es: `125,50`)
   - **Periodo** — etichetta del periodo (es: `Gennaio 2026`, `1° rata 2026`)
   - **Data spesa** — data della bolletta o dell'addebito
   - **Scadenza** (opzionale) — data entro cui pagare
   - **Stato** — `Da pagare` oppure `Pagata`
   - **Descrizione** (opzionale) — note libere
4. Premere **Salva**

### Modificare una spesa

- Premere l'icona matita sulla riga della spesa nella lista
- Modificare i campi desiderati
- Premere **Salva**

### Eliminare una spesa

- Premere l'icona cestino sulla riga della spesa
- Confermare l'eliminazione nel popup

### Cambiare stato pagamento

- Premere il badge **Da pagare** / **Pagata** direttamente sulla riga: lo stato si alterna immediatamente senza aprire il modulo

### Filtrare le spese

**Filtri anno** (pulsanti sopra la lista):
- Selezionare un anno specifico per vedere solo le spese di quell'anno
- **Tutti** mostra l'intero storico

**Pannello filtri avanzati** (icona filtro):
- Filtra per stato (Tutte / Pagate / Da pagare)
- Filtra per categoria
- Ricerca testuale (cerca nel nome categoria, periodo, descrizione)

---

## 7. Statistiche

Accessibile dalla navigazione → **Statistiche**.

### Contenuto

- **Confronto annuale** tra Roma e Nettuno con grafico a barre
- **Trend mensile/per periodo** delle spese
- **Ripartizione per categoria** su più anni
- Selettore anno per esplorare lo storico

### Esportazione dati

Da ogni pagina appartamento è disponibile il pulsante di esportazione:

| Formato | Contenuto |
|---|---|
| **CSV** | Elenco spese dell'anno selezionato, aperto da Excel/Calc |
| **PDF** | Riepilogo stampabile con tabella e totali |
| **CSV Storico** | Tutte le spese di tutti gli anni |

---

## 8. Documenti

Accessibile dalla navigazione → **Documenti**.

### Layout

Su desktop la pagina mostra due colonne affiancate (Roma a sinistra, Nettuno a destra). Su mobile compare un selettore a schede per passare da un appartamento all'altro.

### Caricare un documento

1. Trascinare il file nell'area tratteggiata **oppure** cliccarla per aprire il selettore file
2. Nel popup che appare:
   - **Anno** — selezionare l'anno di riferimento del documento (es: l'anno della bolletta)
   - **Nota** (opzionale) — breve descrizione (es: `Bolletta gas Gennaio 2026`)
3. Premere **Carica**

**Formati accettati:** PDF, immagini (JPG, PNG, WebP, GIF), Word (DOC/DOCX), Excel (XLS/XLSX), testo (TXT)
**Dimensione massima:** 50 MB per file

### Organizzazione per anno

I documenti caricati vengono raggruppati automaticamente per anno all'interno di ogni appartamento. Ogni sezione anno è espandibile/collassabile. L'anno corrente è aperto per default.

### Scaricare / visualizzare un documento

- Passare il mouse sulla riga del documento
- Premere l'icona **download** — si apre il file in una nuova scheda (link firmato valido 1 ora)

### Eliminare un documento

- Premere l'icona **cestino** sulla riga del documento
- Confermare l'eliminazione nel popup

> L'eliminazione cancella sia il file da Supabase Storage sia il record dal database. L'operazione non è reversibile.

---

## 9. Backup & Ripristino

Accessibile dalla navigazione → **Backup**.

### Stato del database

La sezione di riepilogo mostra in tempo reale:
- Numero di appartamenti, categorie, spese e documenti presenti
- Barra spese per anno (numero di spese registrate per ciascun anno)
- Barra documenti per appartamento

### Esportare un backup

1. Premere **Scarica backup JSON**
2. Viene scaricato un file `h2h_backup_AAAA-MM-GG.json`

Il file contiene:
- Dati di tutti gli appartamenti e le categorie
- Tutte le spese (tutti gli anni)
- I metadati di tutti i documenti (nome, anno, note, percorso storage)

> I file fisici dei documenti (PDF, immagini, ecc.) rimangono al sicuro su Supabase Storage cloud e non devono essere inclusi nel backup — non rischiano di andare persi durante un ripristino delle spese.

### Ripristinare da backup

1. Premere **Carica file di backup**
2. Selezionare il file `.json` precedentemente esportato
3. Le spese esistenti vengono aggiornate; quelle mancanti vengono reinserite (**nessun duplicato**)
4. I metadati dei documenti vengono recuperati automaticamente (backup versione 2+)

### Zona pericolosa — Elimina tutte le spese

Elimina tutte le spese dal database. Appartamenti, categorie e documenti rimangono intatti.

> **Effettuare sempre un backup prima di usare questa funzione.**

---

## 10. Impostazioni & Notifiche

Accessibile dalla navigazione → **Impostazioni**.

### Notifiche Pushover

L'applicazione supporta le notifiche push tramite **Pushover**: il giorno in cui una spesa scade (campo "Scadenza") e il suo stato è "Da pagare", viene inviata automaticamente una notifica al tuo dispositivo alle **12:10** (ora italiana estiva, CEST).

### Configurazione

| Campo | Descrizione |
|---|---|
| **User Key** | La chiave personale del tuo account Pushover (visibile su pushover.net dopo il login) |
| **API Token** | Il token dell'applicazione creata su pushover.net → *Your Applications* → *Create an Application* |
| **Toggle on/off** | Abilita o disabilita le notifiche senza cancellare le credenziali |

1. Inserire **User Key** e **API Token**
2. Attivare il toggle
3. Premere **Salva**
4. Premere **Invia notifica di test** per verificare che tutto funzioni

### Come funzionano le notifiche

- Ogni giorno alle **12:10** (ora italiana estiva) il sistema controlla se esistono spese con data di scadenza uguale alla data odierna e stato "Da pagare"
- Per ciascuna spesa trovata viene inviata una notifica con: nome appartamento, categoria, importo e periodo
- Se più spese scadono nello stesso giorno si riceve una notifica per ciascuna
- In inverno (CET, UTC+1) le notifiche arrivano alle **11:10**

> Le notifiche vengono inviate solo se il toggle è attivo e le credenziali sono configurate e valide.

---

## 11. Navigazione e layout

### Barra di navigazione

La barra in alto è sempre visibile e contiene:

| Voce | Funzione |
|---|---|
| Logo H2H | Torna alla Dashboard |
| Roma | Apre la pagina Appartamento Roma |
| Nettuno | Apre la pagina Appartamento Nettuno |
| Statistiche | Apre la pagina Statistiche |
| Documenti | Apre l'archivio documenti |
| Backup | Apre Backup & Ripristino |
| Impostazioni | Apre la configurazione notifiche Pushover |
| Logout | Esce dall'applicazione |

### Design responsive

L'applicazione è ottimizzata per:
- **Desktop** — layout a colonne multiple, dati affiancati
- **Tablet** — layout adattivo a colonne ridotte
- **Mobile** — layout verticale, menu compatto, tab per la sezione Documenti

### Colori identificativi

- **Arancione** — Appartamento Roma
- **Blu** — Appartamento Nettuno

---

## Note tecniche

| Voce | Dettaglio |
|---|---|
| **Backend** | Supabase (PostgreSQL + Storage) |
| **Frontend** | React + Vite + Tailwind CSS |
| **Storage documenti** | Supabase Storage (bucket privato, URL firmati) |
| **Autenticazione** | Session storage locale (credenziali fisse) |
| **Versione** | 8.1 — Luglio 2026 |

---

## Deploy con Docker

### Build e avvio

```bash
# 1. Build dell'immagine Docker
docker compose build

# 2. Avvio del container
docker compose up -d

# 3. Per fermare il container
docker compose down
```

### Accesso nel browser

Una volta avviato il container, l'applicazione è raggiungibile su:

```
http://IP_SERVER:3070
```

> La porta **3070** è mappata verso Nginx (porta 80 interna al container). Se si utilizza un dominio al posto dell'IP: `http://nome-dominio.it:3070`

### Struttura del deploy

| Componente | Dettaglio |
|---|---|
| **Web server** | Nginx (Alpine) |
| **Porta esterna** | 3070 |
| **Porta interna container** | 80 |
| **File di configurazione** | `docker-compose.yml`, `nginx.conf`, `Dockerfile` |

### Note

- Il file `.env` deve essere presente nella root del progetto prima di eseguire il build; contiene le variabili di connessione a Supabase.
- L'immagine Docker include solo i file statici compilati (`dist/`); nessun dato viene salvato localmente nel container.

---

### Aggiornamento dell'applicazione su Ubuntu

Per aggiornare l'applicazione con le ultime modifiche presenti su GitHub, eseguire i comandi seguenti in ordine:

```bash
# 1. Scarica l'ultima versione da GitHub (il .env locale viene preservato)
cd ~/h2h && cp .env /tmp/.env.backup \
  && git fetch origin && git reset --hard origin/main \
  && cp /tmp/.env.backup .env

# 2. Ricostruisce l'immagine e riavvia il container
sudo docker compose up -d --build

# 3. Verifica che il container sia in esecuzione
sudo docker compose ps
```

> Il file `.env` è escluso dal repository (`.gitignore`), quindi il backup/ripristino manuale garantisce che le credenziali Supabase non vengano mai sovrascritte dall'aggiornamento.

---

### Risoluzione errore "permission denied" su docker stop

Su alcuni sistemi Ubuntu il comando `docker compose down` (o `up --build`) può fallire con:

```
Error response from daemon: cannot stop container: ... permission denied
```

**Soluzione rapida** — fermare il container bloccato con kill diretto:

```bash
# Sostituire <container-id> con l'ID mostrato nell'errore (primi 12 caratteri)
sudo kill -9 $(sudo docker inspect --format '{{.State.Pid}}' <container-id>)
sudo docker rm -f <container-id>

# Poi riavviare normalmente
sudo docker compose up -d --build
```

**Soluzione permanente** — a partire dalla versione 3.1 il file `docker-compose.yml` include già:

```yaml
stop_signal: SIGKILL
stop_grace_period: 5s
```

Questo fa sì che Docker utilizzi direttamente SIGKILL invece di SIGTERM, eliminando il problema alla radice. Dopo il primo aggiornamento riuscito l'errore non si ripresenterà.

---

*Manuale generato il 08/07/2026 — H2H Home2Home · Ver. 8.1*
