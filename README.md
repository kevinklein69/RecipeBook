# 🍳 Rezeptbuch

Eine persönliche Rezeptbuch-Web-App, gebaut mit **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma** und **PostgreSQL** (Neon). Deploybar auf **Vercel**.

## Features

- Übersicht aller Rezepte als Karten-Grid (`/`)
- Detailseite mit Zutaten & Zubereitungsschritten (`/recipes/[id]`)
- Rezepte anlegen (`/recipes/new`) und bearbeiten (`/recipes/[id]/edit`)
- REST-API unter `/api/recipes` und `/api/recipes/[id]`
- Kategorien (many-to-many), Zutaten und Schritte pro Rezept

## Tech Stack

| Bereich    | Technologie              |
| ---------- | ------------------------ |
| Framework  | Next.js 15 (App Router)  |
| Sprache    | TypeScript               |
| Styling    | Tailwind CSS             |
| ORM        | Prisma                   |
| Datenbank  | PostgreSQL (Neon)        |
| Hosting    | Vercel                   |

## Setup

### 1. Abhängigkeiten installieren

```bash
npm install
```

> `postinstall` führt automatisch `prisma generate` aus.

### 2. Umgebungsvariablen konfigurieren

Kopiere `.env.example` nach `.env` und trage deine Neon-Verbindung ein:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
```

> Die Connection-String findest du im Neon-Dashboard unter **Connection Details**. Wähle den „Pooled connection"-String für Serverless/Vercel.

#### 📍 Meine Neon-Datenbank

- **Dashboard:** https://console.neon.tech
- **Projekt:** `RecipeBook`
- **Region:** AWS Europe Central 1 (Frankfurt)
- **Datenbank:** `neondb` · **Host:** `ep-spring-scene-asukoygg.c-4.eu-central-1.aws.neon.tech`

> Den vollständigen Connection String (inkl. Passwort) gibt es im Dashboard unter **Connect** → er liegt lokal in der nicht-committeten `.env`.

### 3. Datenbank-Migration ausführen

```bash
npx prisma migrate dev
```

Das erstellt die Tabellen in deiner Datenbank.

### 4. (Optional) Beispieldaten einspielen

```bash
npm run db:seed
```

Fügt 3 Beispielrezepte hinzu (Spaghetti Aglio e Olio, Tiramisu, Pilzrisotto).

### 5. Entwicklungsserver starten

```bash
npm run dev
```

App läuft unter [http://localhost:3000](http://localhost:3000).

## Projektstruktur

```
.
├── prisma/
│   ├── schema.prisma        # Datenbankschema
│   └── seed.ts              # Seed-Script mit Beispielrezepten
├── src/
│   ├── app/
│   │   ├── api/recipes/
│   │   │   ├── route.ts            # GET, POST /api/recipes
│   │   │   └── [id]/route.ts       # GET, PUT, DELETE /api/recipes/[id]
│   │   ├── recipes/
│   │   │   ├── new/page.tsx        # Neues Rezept
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Detailseite
│   │   │       └── edit/page.tsx   # Bearbeiten
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Übersicht
│   │   └── globals.css
│   ├── components/
│   │   ├── RecipeForm.tsx          # Formular für Erstellen & Bearbeiten
│   │   └── DeleteRecipeButton.tsx
│   └── lib/
│       └── prisma.ts               # Prisma-Client-Singleton
├── .env.example
├── package.json
└── tailwind.config.ts
```

## API

| Methode | Route                | Beschreibung              |
| ------- | -------------------- | ------------------------- |
| GET     | `/api/recipes`       | Alle Rezepte              |
| POST    | `/api/recipes`       | Neues Rezept anlegen      |
| GET     | `/api/recipes/[id]`  | Einzelnes Rezept          |
| PUT     | `/api/recipes/[id]`  | Rezept aktualisieren      |
| DELETE  | `/api/recipes/[id]`  | Rezept löschen            |

## Deployment auf Vercel

1. Repository auf GitHub pushen und in Vercel importieren.
2. Environment-Variable `DATABASE_URL` in den Vercel-Projekteinstellungen setzen.
3. Vercel erkennt Next.js automatisch. Der Build-Befehl `prisma generate && next build` ist bereits im `package.json` hinterlegt – eine eigene `vercel.json` ist daher nicht nötig.
4. Migrationen vor dem ersten Deploy lokal mit `npx prisma migrate deploy` (oder via `migrate dev`) gegen die Produktions-DB ausführen.

## Datenmodell

- **Recipe** – Titel, Beschreibung, Portionen, Zubereitungszeit, Bild-URL, Zeitstempel
- **Ingredient** – Name, Menge, Einheit (n:1 zu Recipe)
- **Step** – Reihenfolge, Beschreibung (n:1 zu Recipe)
- **Category** – Name (n:m zu Recipe)
