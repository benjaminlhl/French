# 🥐 Camille, your free AI French tutor

A personal French tutor, powered by Claude, for going from **complete beginner to confident A2 (with B1 survival skills)** in the 12 weeks before you start studying in France. It's free to run and built around **30 minutes a day**, mostly in French, with a focus on daily-life speaking, academic French and listening.

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
- **Listening.** Press 🔊 to hear any message, or turn on auto-read in the chat header. You can choose the French voice and speed in ⚙️.
- **Memory.** Camille keeps private notes about your recurring mistakes, strengths and interests, and uses them in later sessions.
- **Daily plan and streak.** The home screen shows today's 30-minute plan (cards → lesson → listening/situation), your 🔥 streak and a ✈️ countdown to your departure.

## How to use it (free, no API key)

Camille runs as a **Claude Artifact**, a page inside claude.ai. When you chat, Claude answers on **your own Claude account**, so there is no API key and no extra cost. Messages count toward your normal Claude usage limits, the same as chatting with Claude.

1. Open the artifact link in your browser or in the Claude app on your phone (claude.ai → Artifacts).
2. The first time Camille speaks, claude.ai asks you to **allow** the page to use Claude. Choose Allow.
3. Fill in the short welcome form, then start lesson 1.

Your progress, notes and flashcards are saved privately to your Claude account, so they follow you between computer and phone. Chats in progress stay in the browser you used.

Good to know:
- Replies are fast by default. For more careful (slower) answers, turn on *Richer, slower replies* in ⚙️.
- There's no microphone input (claude.ai pages can't use the mic), so type your answers. To practise speaking, read the French out loud before you type it. 🔊 audio playback works everywhere.
- If you hit your Claude usage limit, flashcards and the programme still work, and Camille is back when your limit resets.

## Project layout

```
src/body.html       Page layout
src/style.css       Styles (light and dark)
src/curriculum.js   12-week programme and role-play scenarios
src/prompts.js      Camille's teaching method + per-mode instructions
src/app.js          Chat, rendering, speech, flashcards, progress, account storage
build.mjs           Bundles src/ into camille.html (run: node build.mjs)
camille.html        The single page published as the artifact
```

Bon courage et bon voyage ! 🇫🇷
