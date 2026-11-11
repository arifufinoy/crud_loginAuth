# Acadex · DEBER 6

MVP móvil de **gestión de proyectos académicos y tareas** construido con **Expo SDK 57, React Native, TypeScript, Supabase, Google OAuth, Uniwind y Lottie**. La interfaz completa sigue una identidad **Neobrutalist** (bordes negros gruesos, sombras sólidas desplazadas, colores vibrantes y microinteracciones).

---

## 1. Stack

| Capa | Tecnología |
| --- | --- |
| App | Expo SDK 57 · React Native 0.86 · React 19 |
| Lenguaje | TypeScript strict |
| Backend | Supabase (Postgres + Auth + RLS) |
| Auth | Email/contraseña, Google OAuth (PKCE), recuperación y cambio de contraseña |
| Estilos | **Uniwind 1.13** + Tailwind CSS 4 (`global.css`) |
| Animaciones | **Lottie** (`lottie-react-native`) con archivos de `animaciones/` |
| Navegación | Expo Router (tabs + stack) |
| Fuentes | Archivo Black (títulos) + Space Grotesk (apoyo) |

Animaciones usadas: `dashboard-grid.json` (login), `notification.json` (registro / éxito), `activity-log.json` (cargas), `kpi-meter.json` (dashboard), `folder.json` (proyectos vacíos / confirmaciones), `calendar.json` (tareas vacías).

---

## 2. Puesta en marcha

```bash
npm install
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
```

Completa `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=TU_PUBLISHABLE_KEY
EXPO_PUBLIC_APP_SCHEME=crud
```

> Usa solo la clave pública `publishable` (o la antigua `anon public key`). Nunca pongas una clave `secret`/`service_role` en la app móvil.

Levanta la app:

```bash
npx expo start          # QR / Expo Go
npx expo start --web    # navegador
npx expo run:android    # development build (necesario para probar deep links nativos con scheme crud://)
```

Comprobaciones:

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

---

## 3. Configurar Supabase (obligatorio)

1. Crea un proyecto en <https://supabase.com/dashboard>.
2. Abre **SQL Editor → New query**, pega y ejecuta todo `supabase/schema.sql`.
   - Crea `projects` y `tasks`, claves foráneas, `updated_at`, índices y **políticas RLS** para SELECT/INSERT/UPDATE/DELETE.
   - Cada usuario solo ve y modifica sus propios registros; una tarea solo es válida si su proyecto pertenece al mismo usuario.
3. En **Project Settings → API Keys** copia `Project URL` y la clave `publishable` al `.env`.
4. En **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:8081`
   - **Redirect URLs**:
     - `crud://auth-callback`
     - `crud://auth-callback?flow=oauth`
     - `crud://auth-callback?flow=recovery`
     - `http://localhost:8081/auth-callback`
     - `http://localhost:8081/auth-callback?flow=oauth`
     - `http://localhost:8081/auth-callback?flow=recovery`
     - `exp://**` (solo para desarrollo con Expo Go)
5. En **Authentication → Providers → Email** deja habilitado Email/Password. Si activas “Confirm email”, el registro pedirá confirmar el correo antes de iniciar sesión.
6. Cambia los **email templates** solo si quieres personalizar el branding; el flujo de recuperación ya usa `redirectTo` hacia `auth-callback?flow=recovery`.

### Google OAuth

1. En **Google Cloud Console → APIs & Services → Credentials** crea un **OAuth client ID** de tipo *Web application*.
2. **Authorized redirect URI**:
   ```text
   https://shduhgagxavqsheeurbl.supabase.co/auth/v1/callback
   ```
3. En **Supabase → Authentication → Providers → Google** activa el proveedor y pega:
   - Client ID
   - **Client Secret** (solo en Supabase, nunca en el código móvil)
4. En **Google Cloud → OAuth consent screen** agrega los scopes `email`, `profile`, `openid` y publica la app si corresponde. El Client ID de tipo Web se configura en el proveedor de Supabase; no se agrega a la app.
5. Vuelve a probar **Continuar con Google**. El flujo implementado es:
   `botón → navegador del sistema → Google → Supabase → deep link crud://auth-callback?code=... → exchangeCodeForSession → Dashboard`.

El esquema `crud` ya está declarado en `app.json` (`expo.scheme`). El redirect se genera con `expo-linking` (`Linking.createURL`) en `src/context/auth-context.tsx`.

### Configuración externa pendiente (resumen)

| Dónde | Qué completar |
| --- | --- |
| `.env` | URL y anon key de Supabase |
| Supabase SQL Editor | Ejecutar `supabase/schema.sql` |
| Supabase → Auth → URL Configuration | Redirect URLs de arriba |
| Supabase → Auth → Providers → Google | Client ID + Client Secret |
| Google Cloud Console | OAuth Client ID + redirect URI de Supabase |
| `app.json` | Opcional: iconos/splash definitivos y bundle IDs |

---

## 4. Funcionalidades

### Autenticación
- Registro con nombre completo, correo, contraseña y confirmación; validaciones; mostrar/ocultar contraseña; metadato `full_name`.
- Login con email/contraseña y persistencia de sesión (`AsyncStorage`, `autoRefreshToken`, `persistSession`).
- Google OAuth con **PKCE** (`flowType: 'pkce'`), WebBrowser + deep linking.
- Recuperación de contraseña con enlace profundo (`reset-password`).
- Cambio de contraseña desde Perfil (verifica la contraseña actual; en cuentas Google permite crear una).
- Restauración de sesión, cierre de sesión y protección de rutas privadas con redirección automática.

### CRUD real (Supabase)
- **Proyectos**: crear, listar, buscar, filtrar por estado, ver detalle, editar y eliminar con confirmación.
- **Tareas**: crear (asociada a proyecto), listar global y por proyecto, buscar, filtrar por estado, editar, cambiar estado con un toque y eliminar con confirmación.
- Estadísticas del dashboard calculadas desde Supabase: total, activos, pendientes y completadas.

### Pantallas
1. Login · 2. Registro · 3. Recuperación · 4. Nueva contraseña
5. Dashboard · 6. Lista de proyectos · 7. Crear proyecto · 8. Editar proyecto · 9. Detalle del proyecto
10. Lista de tareas · 11. Crear tarea · 12. Editar tarea · 13. Perfil · 14. Cambio de contraseña
Además: callback OAuth, splash de carga, 404.

---

## 5. Arquitectura

```text
animaciones/                 JSON Lottie
src/
  app/                       rutas Expo Router
    (auth)/                  login, register, forgot, reset
    (app)/                   stack privado
      (tabs)/                dashboard, projects, tasks, profile
      project/               new, [id], edit/[id]
      task/                  new, edit/[id]
      change-password.tsx
    auth-callback.tsx        intercambio PKCE / recuperación
  components/
    ui/                      NeoButton, NeoCard, NeoInput, Screen, Badge...
    auth/                    AuthHero, GoogleButton
    forms/                   ProjectForm, TaskForm
  context/                   auth-context, feedback-context
  hooks/                     use-dashboard, use-projects, use-tasks, use-project
  services/                  supabase client + CRUD
  types/                     Project, Task, estados, prioridades
  utils/                     fechas, validaciones, errores, cn
supabase/schema.sql
global.css                   tema Uniwind / Tailwind 4
```

### Seguridad
- RLS activo en ambas tablas.
- Políticas separadas por operación y usuario autenticado.
- `user_id` con `default auth.uid()` y validación con el proyecto dueño.
- `service_role` jamás se usa en el cliente.
- Errores de Supabase traducidos a mensajes claros.

---

## 6. Notas de implementación

- **Uniwind** es el único sistema de estilos: no hay `StyleSheet` en las pantallas nuevas. `metro.config.js` envuelve Metro con `withUniwindConfig` y `global.css` define colores, fuentes y tipografías. Los únicos estilos inline son dimensiones dinámicas inevitables (ancho de barra de progreso y safe-area del tab bar).
- **Lottie** se usa en login, registro, cargas, dashboard, estados vacíos, confirmaciones y feedback de éxito/error.
- `Uniwind` se usa también en `LottieView` mediante `withUniwind`.
- Las fechas se capturan como `AAAA-MM-DD` y se validan antes de enviar a Postgres (`date`).
- El componente `NeoButton` implementa la sombra sólida con una capa negra desplazada y feedback de presión.
- `FeedbackProvider` muestra un modal Lottie para operaciones exitosas o errores.

## 7. Scripts

```bash
npm start            # expo start
npm run android
npm run ios
npm run web
npm run lint
npx tsc --noEmit
```
