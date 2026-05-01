# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install                    # Install dependencies
pnpm android                    # Run on Android (or npx expo run:android)
pnpm ios                        # Run on iOS (or npx expo run:ios)
pnpm start                      # Start Expo dev server
```

## Architecture

Clean layered architecture. **Never mix persistence logic into views.**

```
src/
├── views/          # Screens, components, navigation, styles
├── viewmodel/      # MobX observable state (presentation logic)
├── repository/     # Realm data access only
├── models/         # Realm schema definitions
├── types/          # TypeScript domain types + file format types
├── context/        # ThemeContext (light/dark + AsyncStorage) + ViewModelContext
├── services/       # GendyFileService (.gendy export/import), filePickerService
└── utils/          # Type converters
```

**New feature order:** `types/models` → `repository` → `viewmodel` → `views`

## State Management (MobX)

- ViewModels use `makeAutoObservable()` 
- Screens consume via `useViewModelContext()` hook
- Each ViewModel exposes: `loading`, `error`, data collections
- Business logic stays in ViewModel/Repository — not in JSX

## Persistence (Realm)

- All Realm access centralized in `repository/`
- Schema version managed in `src/database/realm.tsx` — increment on schema change
- 6 schemas: Usuario, Horario, Materia, Clase, ActividadUni, Actividad
- Relationships: Horario → Materia[] → Clase[]
- Primary keys: `BSON.ObjectId`
- Validate Realm objects before access (avoid invalidated object errors)

## Theming

- Light/dark themes in `src/views/styles/theme.ts`
- Always use `useTheme()` for colors — no hardcoded hex values
- Persisted via AsyncStorage
- react-native-paper Material Design 3 + styled-components/native

## Navigation

- BottomTabNavigator: 3 tabs (Horarios, Home/Inicio, Calendario)
- NativeStackNavigator: wraps tabs, adds Settings modal
- Add new routes typed in `src/views/navigation/`

## Code Conventions

- Strict TypeScript — no `any` without real necessity
- UI labels in Spanish (the app's language)
- Reuse existing components before creating new ones
- No new UI libraries without clear justification
- Keep changes small and focused — don't touch unrelated behavior
