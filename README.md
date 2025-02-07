# Aplikacja do zarządzania projektami

## Wymagania
- Node.js (wersja 18 lub wyższa)
- npm (dołączony do Node.js)

## Instalacja i uruchomienie

1. Sklonuj repozytorium:
```bash
git clone [adres_repozytorium]
cd inzynierka
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj zmienne środowiskowe:
- Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```
- Zmodyfikuj wartości w pliku `.env` według potrzeb

4. Zainicjalizuj bazę danych:
```bash
npx prisma db pull # zaczytanie istniejącego schematu bazy danych
npx prisma generate # wygenerowanie klienta Prisma
npx prisma db push # zastosowanie schematu do bazy danych
```

5. Uruchom aplikację w trybie deweloperskim:
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

## Dodatkowe komendy

- Budowanie aplikacji:
```bash
npm run build
```

- Uruchomienie zbudowanej aplikacji:
```bash
npm start
```

- Uruchomienie lintera:
```bash
npm run lint
```

## Technologie
- Next.js 14
- Prisma
- NextAuth.js
- TypeScript
- Tailwind CSS
- React Query 