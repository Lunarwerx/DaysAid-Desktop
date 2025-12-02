# DaysAid - React + Capacitor + Electron

A cross-platform note-taking app built with React, TypeScript, and modern tooling.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Mobile**: Capacitor (iOS + Android)
- **Desktop**: Electron
- **Web**: PWA-ready

## Getting Started

### Install Dependencies

```bash
cd app
npm install
```

### Development

```bash
# Web development
npm run dev

# Desktop development (Electron)
npm run electron:dev
```

### Build Commands

```bash
# Build for web (PWA)
npm run build:web

# Build for iOS (requires Mac + Xcode)
npm run build:ios
npx cap open ios

# Build for Android (requires Android Studio)
npm run build:android
npx cap open android

# Build for Desktop (Electron)
npm run build:desktop
```

## Project Structure

```
app/
├── src/
│   ├── components/      # React components
│   │   ├── AuthScreen.tsx
│   │   ├── InputView.tsx
│   │   ├── ListView.tsx
│   │   ├── SettingsView.tsx
│   │   └── TitleBar.tsx
│   ├── context/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── NotesContext.tsx
│   │   └── SettingsContext.tsx
│   ├── lib/             # Utilities
│   │   ├── platform.ts
│   │   └── supabase.ts
│   ├── types/           # TypeScript types
│   │   ├── database.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── electron/            # Electron main process
│   ├── main.js
│   └── preload.js
├── public/              # Static assets
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── capacitor.config.ts
```

## Platform-Specific Features

### Desktop Only (Electron)
- Global hotkey (configurable)
- System tray
- Mouse follower notification

### All Platforms
- PWA installable
- Offline capable
- Supabase sync
- Categories with subscriptions
- Note completion tracking
