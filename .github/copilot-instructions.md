# Copilot Instructions para Gendy

## Contexto del proyecto
- Proyecto móvil con **Expo + React Native + TypeScript**.
- Navegación con **React Navigation** (tabs + stack).
- UI con **react-native-paper** y **styled-components/native**.
- Estado con **MobX** (`makeAutoObservable`) en capa ViewModel.
- Persistencia local con **Realm**.

## Estructura y arquitectura (seguir siempre)
- Mantén la separación por capas actual:
  - `src/views`: pantallas, navegación y componentes visuales.
  - `src/viewmodel`: lógica de presentación y estado observable.
  - `src/repository`: acceso a datos/persistencia.
  - `src/models` + `src/types`: modelos Realm y tipos de dominio.
  - `src/context`: providers globales (`ThemeContext`, `ViewModelContext`).
- Evita mezclar lógica de persistencia en pantallas.
- Si se agrega una feature de dominio, implementar en orden:
  1. `types/models`
  2. `repository`
  3. `viewmodel`
  4. `views/components/screens`

## Convenciones de código
- Escribir en **TypeScript estricto** y evitar `any` salvo necesidad real.
- Seguir el estilo existente del repo (nombres de archivos y exportaciones).
- Preferir funciones pequeñas y explícitas.
- No introducir complejidad innecesaria ni nuevas abstracciones sin beneficio claro.
- No renombrar ni mover archivos existentes a menos que se solicite.

## React Native / UI
- Reutilizar componentes existentes antes de crear nuevos.
- Mantener coherencia con `react-native-paper` + `styled-components`.
- Usar el tema desde `useTheme()` para colores y estilos siempre que sea viable.
- Evitar hardcodear colores/tamaños si ya existe alternativa en tema/estilos compartidos.
- No agregar librerías de UI nuevas sin justificación clara.

## Estado y ViewModels
- La pantalla consume estado y acciones desde `useViewModelContext()`.
- La lógica de negocio y transformación de datos debe vivir en ViewModel/Repository, no en el JSX.
- En ViewModels:
  - mantener propiedades observables claras (`loading`, `error`, colecciones de datos),
  - manejar errores de forma explícita,
  - evitar efectos secundarios ocultos.

## Persistencia con Realm
- Centralizar acceso a Realm en `repository` y utilidades de base de datos.
- Si cambia el esquema, actualizar `schemaVersion` en `src/database/realm.tsx`.
- Conservar compatibilidad de tipos (`BSON.ObjectId`, fechas, listas) y conversiones existentes.
- Evitar acceder a objetos Realm invalidados sin validaciones.

## Navegación
- Mantener estructura de navegación actual (`MainTabs` + `Settings` en stack).
- Si se agregan rutas, tiparlas y mantener consistencia de nombres.

## Calidad y cambios
- Los cambios deben ser **pequeños, focalizados y seguros**.
- No modificar comportamiento no relacionado con la tarea.
- Si agregas lógica nueva, considera estados de error/carga vacíos.
- Al terminar, verificar que compile en TypeScript y que no rompa flujos existentes.

## Comandos útiles
- Instalar dependencias: `pnpm install`
- Ejecutar Android: `pnpm android` (o `npx expo run:android`)
- Ejecutar iOS: `pnpm ios` (o `npx expo run:ios`)

## Preferencias al generar código
- Priorizar soluciones sencillas y legibles.
- Mantener textos y etiquetas de UI en español si el contexto de la pantalla está en español.
- Antes de crear un componente nuevo, evaluar si puede extenderse uno existente en `src/views/components`.
- No agregar comentarios redundantes; el código debe ser autoexplicativo.
