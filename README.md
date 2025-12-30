# 🦙 Ollama Chat – Chrome Extension

Eine lokale Chat-Oberfläche für **Ollama**, gebaut mit **Vue 3**, **Bootstrap** und **Pinia** – komplett **ohne Backend**.  
Die Extension verbindet sich direkt mit einer lokal laufenden Ollama-Instanz.

---

## ✅ Voraussetzungen

- **Google Chrome** (oder Chromium-basierter Browser)
- **Ollama** installiert & gestartet  
  👉 https://ollama.com
- Mindestens ein installiertes Modell (z. B. `llama3`)

---

## 📦 Ollama vorbereiten

### 1️⃣ Ollama starten

```bash
ollama serve
```

Standardmäßig läuft Ollama unter:

```
http://localhost:11434
```

---

### 2️⃣ CORS / Zugriff für Chrome Extension erlauben (WICHTIG)

Chrome Extensions gelten als **andere Origin**.  
Starte Ollama mit erlaubten Origins:

## 🐧 Linux (systemd) – Empfohlene Methode

Wenn Ollama als **systemd Service** läuft:

### 1️⃣ Service Override erstellen

```bash
sudo systemctl edit ollama
```

---

### 2️⃣ Folgendes einfügen

```ini
[Service]
Environment="OLLAMA_ORIGINS=http://localhost chrome-extension://*"
```

💡 Alternativ (unsicherer, aber einfach):

```ini
Environment="OLLAMA_ORIGINS=*"
```

---

### 3️⃣ Service neu laden & starten

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

### 4️⃣ Prüfen, ob Variable gesetzt ist

```bash
systemctl show ollama | grep OLLAMA_ORIGINS
```

Erwartete Ausgabe z. B.:

```
Environment=OLLAMA_ORIGINS=http://localhost chrome-extension://*
```

---


#### macOS / Linux
```bash
OLLAMA_ORIGINS=chrome-extension://fcnljhgjdceeojoipjbpgponacoinlbi ollama serve
```

#### Windows (PowerShell)
```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

---

### 3️⃣ Testen, ob Ollama erreichbar ist

Öffne im Browser:

```
http://localhost:11434/api/version
```

Erwartete Antwort:
```json
{ "version": "x.y.z" }
```

---

## 📁 Projektstruktur

Nach dem Build (oder im Repo) findest du z. B.:

```
localama/
├─ extension/
│  ├─ index.html
│  ├─ assets/
│  └─ manifest.json
│  └─ ...
├─ src/
├─ README.md
```

👉 **Nur das `extension/`-Verzeichnis wird in Chrome geladen**

---

## 🧩 Chrome Extension installieren

1. Öffne `chrome://extensions`
2. Aktiviere **Entwicklermodus**
3. Klicke auf **„Entpackte Erweiterung laden“**
4. Wähle den Ordner `extension/`

---

## 🧪 Erste Nutzung

1. Extension öffnen
2. Modell auswählen
3. Chat starten

---

## 🔐 Datenschutz

- Keine Cloud
- Keine Server
- Alle Daten bleiben lokal

---

## 📄 Lizenz

MIT License
