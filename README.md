# Beyond Borders - Travel Blog

## Übersicht
Beyond Borders ist eine Web-Anwendung, die Ihren Urlaub stressfrei gestaltet! Bei uns erhalten Sie Reisetipps, können Reiseziele suchen und Ihre Packliste online speichern!

### Haupt-Features:
- Accounterstellung und -verwaltung
- Reisezielsuche mit Favoritenspeicherung für angemeldete Nutzer
- Reisetipps
- Packliste
- Newsletter-Anmeldung
- responsives Design


## Anleitung für das lokale Hosten der Website

### 1. Im Terminal in den Projektordner navigieren
```sh
cd path-to-project
```

### 2. Erstelle eine `.env`-Datei im Stil der `.env.example`-Datei
```sh
python generate_secret.py
```

### 3. Virtual Environment im Projektordner aufsetzen
```sh
python -m venv .venv
```

### 4. Virtual Environment aktivieren
Windows
```sh
.venv/Scripts/activate
```
UNIX
```sh
source .venv/bin/activate
```

### 5. Dependencies installieren
```sh
python -m pip install -r requirements.txt
```

### 6. Anwendung als Docker Container starten
Falls noch nicht vorhanden, muss Docker Desktop heruntergeladen und gestartet werden.
```sh
docker compose up -d
```

### 7. Uvicorn Webserver starten
```sh
uvicorn main:app --reload
```
