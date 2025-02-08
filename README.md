# AudioPlan

## Wymagania
- Node.js (wersja 18 lub wyższa)
- npm (dołączony do Node.js)

## Instalacja i uruchomienie


1. Zainstaluj zależności:
```bash
npm install
```

2. Skonfiguruj zmienne środowiskowe:
- Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```

3. Zainicjalizuj bazę danych:
```bash
npx prisma migrate dev
```

4. Uruchom aplikację w trybie deweloperskim:
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



