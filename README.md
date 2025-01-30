# Transform your $20 Cursor into a Devin-like AI Assistant

This repository gives you everything needed to supercharge your Cursor or Windsurf IDE with **advanced** agentic AI capabilities—similar to the $500/month Devin—but at a fraction of the cost. In under a minute, you'll gain:

* Automated planning and self-evolution, so your AI "thinks before it acts" and learns from mistakes
* Extended tool usage, including web browsing, search engine queries, and LLM-driven text/image analysis
* [Experimental] Multi-agent collaboration, with o1 doing the planning, and regular Claude/GPT-4o doing the execution.

## Why This Matters

Devin impressed many by acting like an intern who writes its own plan, updates that plan as it progresses, and even evolves based on your feedback. But you don't need Devin's $500/month subscription to get most of that functionality. By customizing the .cursorrules file, plus a few Python scripts, you'll unlock the same advanced features inside Cursor.

## Key Highlights

1.	Easy Setup
   
   Copy the provided config files into your project folder. Cursor users only need the .cursorrules file. It takes about a minute, and you'll see the difference immediately.

2.	Planner-Executor Multi-Agent (Experimental)

   Our new [multi-agent branch](https://github.com/grapeot/devin.cursorrules/tree/multi-agent) introduces a high-level Planner (powered by o1) that coordinates complex tasks, and an Executor (powered by Claude/GPT) that implements step-by-step actions. This two-agent approach drastically improves solution quality, cross-checking, and iteration speed.

3.	Extended Toolset

   Includes:
   
   * Web scraping (Playwright)
   * Search engine integration (DuckDuckGo)
   * LLM-powered analysis

   The AI automatically decides how and when to use them (just like Devin).

4.	Self-Evolution

   Whenever you correct the AI, it can update its "lessons learned" in .cursorrules. Over time, it accumulates project-specific knowledge and gets smarter with each iteration. It makes AI a coachable and coach-worthy partner.
	
## Usage

1.	Copy this repository's contents into your Cursor or Windsurf project.
2.	For Cursor, .cursorrules is automatically loaded. For Windsurf, add .windsurfrules plus the Scratchpad for updates.
3.	Adjust .env with your own API keys, run pip install -r requirements.txt, and you're all set.
4.	Start exploring advanced tasks—such as data gathering, building quick prototypes, or cross-referencing external resources—in a fully agentic manner.

## Want the Details?

Check out our [blog post](https://yage.ai/cursor-to-devin-en.html) on how we turned $20 into $500-level AI capabilities in just one hour. It explains the philosophy behind process planning, self-evolution, and fully automated workflows. You'll also find side-by-side comparisons of Devin, Cursor, and Windsurf, plus a step-by-step tutorial on setting this all up from scratch.

License: MIT

# Instrukcja uruchomienia aplikacji

## Wymagania systemowe
- Node.js (wersja 18 lub wyższa)
- npm (wersja 8 lub wyższa)
- Git

## Scenariusz 1: Czysta instalacja

1. Sklonuj repozytorium:
```bash
git clone [adres-repozytorium]
cd [nazwa-folderu]
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```

4. Uzupełnij plik `.env` o wymagane zmienne środowiskowe:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="twój-sekretny-klucz"
```

5. Zainicjalizuj bazę danych:
```bash
npx prisma migrate dev
```

6. Uruchom aplikację w trybie deweloperskim:
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

## Scenariusz 2: Aktualizacja istniejącej instalacji

Jeśli masz już zainstalowaną poprzednią wersję aplikacji, wykonaj poniższe kroki:

1. Zatrzymaj działającą aplikację (jeśli jest uruchomiona)

2. Zaktualizuj kod z repozytorium:
```bash
git pull origin main
```

3. Zainstaluj/zaktualizuj zależności:
```bash
npm install
```

4. Usuń starą bazę danych:
```bash
rm prisma/dev.db
```

5. Zresetuj i zaktualizuj bazę danych:
```bash
npx prisma migrate reset --force
```

6. Uruchom aplikację:
```bash
npm run dev
```

## Rozwiązywanie problemów

### Problem z bazą danych
Jeśli występują problemy z bazą danych, możesz spróbować wykonać pełny reset:
```bash
rm prisma/dev.db
npx prisma migrate reset --force
```

### Problem z zależnościami
W przypadku problemów z zależnościami, usuń folder node_modules i zainstaluj je ponownie:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Problem z typami
Jeśli występują problemy z typami Prisma, wygeneruj je ponownie:
```bash
npx prisma generate
```

## Struktura projektu

```
├── app/                    # Główny katalog aplikacji Next.js
├── prisma/                 # Konfiguracja i migracje Prisma
├── public/                 # Statyczne pliki
├── components/            # Komponenty React
└── lib/                   # Biblioteki i konfiguracje
```

## Technologie

- Next.js 14
- Prisma
- SQLite
- NextAuth.js
- Tailwind CSS
- TypeScript
