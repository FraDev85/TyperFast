# TyperFast ⌨️

> Test di velocità di digitazione con certificato PDF, tastiera virtuale e sistema di gradi.

![TypeMaster](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)
![jsPDF](https://img.shields.io/badge/jsPDF-2.5-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Descrizione

**TypeMaster** è un'applicazione web per misurare la velocità di digitazione (WPM — _Words Per Minute_) e l'accuratezza. Al termine del test, l'utente può scaricare un **certificato PDF personalizzato** con i propri risultati e il grado ottenuto.

---

## ✨ Funzionalità

- ⏱ **Durate selezionabili** — test da 30, 60, 90 o 120 secondi
- ⚡ **Calcolo WPM in tempo reale** durante la digitazione
- ✓ **Accuratezza in tempo reale** con feedback visivo carattere per carattere
- 🎹 **Tastiera virtuale** con highlight dei tasti premuti (corretti/errati)
- 🏆 **Sistema di gradi** — C, B, A, S in base alla velocità raggiunta
- 📄 **Certificato PDF** personalizzato con nome, statistiche e grado
- 🎬 **Countdown animato** prima dell'inizio del test
- 🔄 **Reset rapido** per ricominciare in qualsiasi momento

---

## 🏆 Sistema di Gradi

| Grado | WPM richiesti | Titolo           |
| ----- | ------------- | ---------------- |
| S     | ≥ 80 WPM      | Esperto Assoluto |
| A     | ≥ 60 WPM      | Velocista        |
| B     | ≥ 40 WPM      | Intermedio       |
| C     | < 40 WPM      | Principiante     |

---

## 🚀 Installazione e avvio

### Prerequisiti

- [Node.js](https://nodejs.org/) v18 o superiore
- npm v9 o superiore

### Passi

```bash
# 1. Clona il repository
git clone https://github.com/tuo-utente/typemaster.git
cd typerfast

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo
npm run dev
```

L'app sarà disponibile su **http://localhost:5173**

---

## 📦 Build di produzione

```bash
npm run build
npm run preview
```

I file ottimizzati vengono generati nella cartella `dist/`.

---

## 🗂 Struttura del progetto

```
TypeFaster/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── TypingFaster.jsx   # Componente principale
│   │   ├── keyboard.js        # Layout tastiera e testi
│   │   └── utils.js           # Calcolo gradi e generazione PDF
│   ├── App.jsx
│   ├── App.css                # Stili globali e variabili CSS
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠 Stack tecnologico

| Tecnologia                                 | Versione | Utilizzo                    |
| ------------------------------------------ | -------- | --------------------------- |
| [React](https://react.dev/)                | 19       | UI e gestione stato         |
| [Vite](https://vitejs.dev/)                | 8        | Build tool e dev server     |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5      | Generazione certificato PDF |

---

## 🎮 Come si usa

1. **Seleziona la durata** del test (30s, 60s, 90s, 120s)
2. Clicca **▶ Inizia Test** — parte un countdown di 3 secondi
3. **Digita il testo** mostrato sullo schermo nel minor tempo possibile
4. Al termine visualizzi le tue **statistiche complete**
5. Inserisci il tuo **nome** e scarica il **certificato PDF**

---

## 📄 Licenza

Distribuito sotto licenza **MIT**. Vedi il file [LICENSE](../LICENSE) per i dettagli.

---

<p align="center">TypeMaster &copy; 2025 — Test di velocità di digitazione</p>
