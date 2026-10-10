# 🥐 Camille, your AI French tutor

A personal French tutor, powered by Claude, for going from **complete beginner to confident A2 (with B1 survival skills)** in the 12 weeks before you start studying in France. It's built around **30 minutes a day**, mostly in French, with a focus on daily-life speaking, academic French and listening.

## What you get

| | |
|---|---|
| 📅 **Daily lesson** | An 84-day programme (12 weeks × 6 lessons + 1 review). Each ~20-min lesson is interactive: warm-up → key phrases → model dialogue you *listen* to → grammar in a nutshell → exercises → mini role-play → wrap-up. Weekly review days include a scored mini-test. |
| 🎭 **Situations** | 18 role-plays for your first weeks in France: airport, boulangerie, café, visiting a flat, bank account, phone plan, titre de séjour/OFII, CAF housing aid, university registration, meeting classmates, talking to a professor, group work, doctor, pharmacy, train tickets, calling your landlord, a student party… Camille plays the other person, helps you if you're stuck, and debriefs you with a mark out of 10. |
| 🎧 **Listening** | Short audio texts (voicemails, métro announcements, a professor announcing an exam…) with hidden transcripts, comprehension questions and dictations. They get faster and more natural as you improve. |
| 🎓 **Academic French** | Mini-lectures and note-taking, formal emails to professors and the scolarité, classroom phrases, university vocabulary (CM, TD, partiel, ECTS…), adapted to your field. |
| 💬 **Free conversation** | Just chat. |
| 🃏 **Flashcards** | Tap any <u>underlined word</u> in Camille's messages to see its translation, hear it, and add it to your deck. Cards are reviewed with spaced repetition (SM-2 style) and come back in both directions. Camille also weaves your due words into lessons. |

How it teaches:
- **Immersion with a safety net.** Camille writes simple French and glosses new words. The chips under the chat give you 🇬🇧 *En anglais*, 🐢 *Plus simple*, 💡 *Indice* and ⏭️ *Suivant*, and you can always write in English.
- **Corrections** appear as ✏️ lines (the 2 most important mistakes, with a short reason) before the conversation continues.
- **Speaking.** Press 🎤 to talk in French (Chrome, Edge or Safari). Press 🔊 to hear any message, or turn on auto-read in the chat header. You can choose the French voice and speed in ⚙️.
- **Memory.** Camille keeps private notes about your recurring mistakes, strengths and interests, and uses them in later sessions.
- **Daily plan and streak.** The home screen shows today's 30-minute plan (cards → lesson → listening/situation), your 🔥 streak and a ✈️ countdown to your departure.

## Setup (5 minutes)

You need [Node.js](https://nodejs.org/) 20.12 or newer and an Anthropic API key from https://console.anthropic.com/.

```bash
git clone <this repo> && cd French
npm install
cp .env.example .env        # then open .env and paste your API key
npm start
```

Open **http://localhost:3000** in Chrome, Edge or Safari. The first screen asks a few questions about you (name, languages you speak, where you're going, what you'll study, departure date) so lessons fit your life.

### Using it on your phone
Set `HOST=0.0.0.0` in `.env`, restart, and open `http://<your-computer's-IP>:3000` on your phone (same Wi-Fi). Audio playback works. The 🎤 microphone needs a secure origin, so on the phone it only works over https (for example through a tunnel such as `cloudflared` or `ngrok`). Only open the port on networks you trust: anyone who can reach it can use your API key.

### Your data
Progress, flashcards and chats are stored in your browser (localStorage). Use ⚙️ → *Sauvegarde* to export or import a backup, for example to move to another device.

## Cost
It uses `claude-opus-5-5` (override with `TUTOR_MODEL` in `.env`) at low effort for conversation and medium effort for lessons, with prompt caching. A 30-minute session typically costs roughly $0.30–$1, depending on how much you chat. Switch to `claude-sonnet-5-5` to roughly halve that. Check usage in the Anthropic console.

## Project layout

```
server.js            Tiny Node server: static files + /api/chat streaming endpoint (Anthropic SDK)
prompts.js           Camille's teaching method + per-mode instructions (lesson, role-play, listening…)
public/curriculum.js 12-week programme and the role-play scenarios
public/app.js        The app: chat, rendering, speech, flashcards, progress
public/index.html    Layout
public/style.css     Styles (light and dark mode)
```

Bon courage et bon voyage ! 🇫🇷
