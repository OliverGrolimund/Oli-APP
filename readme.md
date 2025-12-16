# Sport Event Manager

Eine Progressive Web App zur Verwaltung von Sport-Events mit Spieler-Anmeldungen.

## Features

### UserView
- Login mit Email und Passwort (keine Registrierung, kein PW-Change)
- Fixe Spielerliste (Spitzname und Email)
- Liste von Events mit Datum, von/bis-Zeit und Ort
- Total der Teilnehmer
- Zusage (grün), Absage (rot)
- Utensilien als Liste über den Anmeldungen (Ball, Pumpe, Überzieher)
- Gäste und Kommentar mit Symbol in der Zelle

### AdminView
- Spieler aktivieren/blockieren (Liste fix)
- Events erstellen
- Anzeige der definierten Utensilien

## Technologie-Stack

- **Frontend**: React mit TypeScript-Komponenten
- **Styling**: Tailwind CSS
- **Backend**: Node.js / Next.js
- **Datenbank**: Supabase
- **Deployment**: GitHub Actions → Vercel
- **PWA**: Progressive Web App Support

## Installation & Setup

### 1. Repository klonen
```bash
git clone <repository-url>
cd sport-event-management
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen einrichten
Kopiere `.env.example` nach `.env.local` und füge deine Supabase-Credentials ein:

```bash
cp .env.example .env.local
```

Bearbeite `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Datenbank einrichten

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Öffne den SQL-Editor in deinem Supabase Dashboard
3. Kopiere den Inhalt von `001_initial_schema.sql`
4. Führe das SQL-Script aus

### 5. Entwicklungsserver starten
```bash
npm run dev
```

Die App ist nun unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Deployment

### GitHub Actions Setup

1. Erstelle ein Vercel-Projekt und verbinde es mit deinem GitHub-Repository
2. Füge folgende Secrets zu deinem GitHub-Repository hinzu:
   - `VERCEL_TOKEN`: Dein Vercel API Token
   - `VERCEL_ORG_ID`: Deine Vercel Organization ID
   - `VERCEL_PROJECT_ID`: Deine Vercel Project ID
   - `NEXT_PUBLIC_SUPABASE_URL`: Deine Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Dein Supabase Anon Key

3. Bei jedem Push auf `main` wird die App automatisch deployed

### Manuelles Deployment

```bash
npm run build
npm run start
```

## Projekt-Struktur

```
sport-event-management/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions Workflow
├── public/
│   └── manifest.json           # PWA Manifest
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root Layout
│   │   ├── page.tsx           # Hauptseite
│   │   └── globals.css        # Globale Styles
│   ├── components/
│   │   ├── LoginForm.tsx      # Login-Komponente
│   │   ├── EventList.tsx      # Event-Liste für User
│   │   └── AdminPanel.tsx     # Admin-Panel
│   ├── lib/
│   │   └── supabase.ts        # Supabase Client & Types
│   └── store/
│       └── authStore.ts       # Zustand Auth Store
├── .env.example                # Beispiel Umgebungsvariablen
├── next.config.js              # Next.js Konfiguration
├── package.json
├── tailwind.config.ts          # Tailwind Konfiguration
├── tsconfig.json               # TypeScript Konfiguration
└── vercel.json                 # Vercel Konfiguration
```

## Entwicklung

### Type-Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
```

## Authentifizierung

Die App verwendet ein vereinfachtes Authentifizierungssystem:
- Keine Registrierung möglich
- Keine Passwort-Änderung
- Admin muss Spieler manuell in der Datenbank anlegen
- Session-Management über localStorage

**Hinweis**: Für Production sollte ein sichereres Authentifizierungssystem implementiert werden.

## Lizenz

Privates Projekt - Alle Rechte vorbehalten