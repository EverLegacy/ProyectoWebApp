# PuntosApp 

Aplicación web de tarjeta de puntos similar a Spin Premia / OXXO Premia. Los usuarios acumulan puntos al realizar compras en tiendas participantes y los canjean por recompensas.

---

## Desplegado
https://loyalty-app-frontend-6jdo.onrender.com

##  Equipo

> Elena Isabel Espriella Bustamante - Adrian Moises Martinez Hernandez - Frida Julieta Gonzalez Mena

##  Repositorio

> https://github.com/EverLegacy/ProyectoWebApp

---

##  Demo

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

### Acceso de prueba

El usuario seed actualmente no tiene contraseña funcional (ver BUG-008). Regístrate en /register para crear una cuenta de prueba real con una contraseña de mas de 6 caracteres.

##  Arquitectura del proyecto

```
loyalty-app/
├── frontend/       React + TypeScript (Vite)
│   └── src/
│       ├── components/     Navbar
│       ├── pages/          Login, Register, Dashboard, Rewards, Transactions,
│       │                   ForgotPassword, ResetPassword
│       ├── hooks/          useAuth
│       ├── services/       axios API client
│       └── types/          TypeScript interfaces
└── backend/        Node.js + Express + TypeScript (REST API)
    └── src/
        ├── domain/           Lógica de negocio pura
        ├── application/      Servicios / casos de uso
        ├── infrastructure/   PostgreSQL, MongoDB, repositorios
        ├── controllers/      Controladores HTTP
        ├── middleware/       JWT auth, logging, correlation ID
        ├── logger/           Winston (JSON + redacción PII)
        ├── routes/           auth, points, rewards, stores
        └── models/
            ├── postgres/     schema.sql, seed.sql
            └── mongo/        ActivityLog, Notification, etc.
```

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript (Vite) |
| Backend | Node.js + Express + TypeScript |
| BD Relacional | PostgreSQL |
| BD No-Relacional | MongoDB |
| Autenticación | JWT (JSON Web Tokens) |
| Logging backend | Winston (JSON estructurado) |
| Logging frontend | Datadog Browser Logs |
| APM backend | dd-trace (Datadog) |

---

##  Bases de datos

### PostgreSQL — 6 tablas relacionales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios registrados (nombre, email, contraseña hasheada) |
| `stores` | Tiendas participantes (nombre, ubicación, categoría) |
| `loyalty_cards` | Tarjeta de puntos por usuario (saldo, número, nivel) |
| `transactions` | Compras realizadas y puntos ganados por transacción |
| `rewards` | Recompensas disponibles para canjear (costo en puntos, stock) |
| `redemptions` | Historial de canjes realizados por usuarios |

### MongoDB — 6 colecciones no-relacionales

| Colección | Descripción |
|-----------|-------------|
| `activity_logs` | Registro de acciones: scans, canjes, logins |
| `notifications` | Notificaciones enviadas a usuarios |
| `reward_catalog` | Contenido enriquecido de recompensas (imágenes, tags) |
| `user_sessions` | Sesiones activas e información de dispositivo |
| `store_analytics` | Resumen diario de ventas y puntos emitidos por tienda |
| `app_config` | Configuración dinámica (multiplicadores de puntos, niveles) |

**Total: 12 tablas/colecciones** 

### Datos de prueba incluidos

**5 tiendas:** OXXO Centro, OXXO Plaza Mayor, Farmacia del Ahorro, Súper Gutiérrez, Gasolinería Norte

**10 recompensas:**

| Recompensa | Puntos |
|-----------|--------|
| Snack gratis | 100 |
| Refresco 600ml | 150 |
| Café gratis | 200 |
| Litro de leche gratis | 250 |
| Descuento $20 | 300 |
| Sandwich gratis | 350 |
| Descuento $50 | 600 |
| Carga de datos 1GB | 500 |
| Vale gasolina $50 | 800 |
| Canasta básica | 1500 |

---

## Cómo correr el proyecto

### Requisitos previos

- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+

### 1. Clonar el repositorio

```bash
git clone https://github.com/EverLegacy/ProyectoWebApp.git
cd loyalty-app
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=3000
LOG_LEVEL=info
LOG_FORMAT=pretty
NODE_ENV=development

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=loyalty_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password
MONGO_URI=mongodb://localhost:27017/loyalty_logs
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d

# Opcional — enviar logs del backend a Datadog (además de la terminal)
# DD_API_KEY=tu_api_key_de_datadog
DD_SITE=us5.datadoghq.com
DD_SERVICE=loyalty-app-api
```

Crear la base de datos e inicializar tablas:

```bash
psql -U postgres -c "CREATE DATABASE loyalty_db;"
psql -U postgres -d loyalty_db -f src/models/postgres/schema.sql
psql -U postgres -d loyalty_db -f src/models/postgres/seed.sql
```

Iniciar el servidor:

```bash
npm run dev
# Corre en http://localhost:3000
# Verás logs en la terminal al arrancar y en cada request HTTP
```

Otros comandos útiles:

```bash
npm run build   # compila TypeScript a dist/
npm start       # ejecuta dist/index.js (producción)
npm test        # pruebas unitarias (Vitest)
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

---

##  Observabilidad y logs

### Backend (terminal)

Al correr `npm run dev` deberías ver logs como:

```
2026-06-22T23:35:00.961Z info: postgres_connected {"service":"loyalty-app-api"}
2026-06-22T23:35:01.120Z info: mongodb_connected {"service":"loyalty-app-api"}
2026-06-22T23:35:01.125Z info: server_started {"port":3000,"env":"development","service":"loyalty-app-api"}
2026-06-22T23:35:05.200Z info: http_request {"type":"http_request","correlationId":"...","method":"GET","url":"/api/health","statusCode":200,"responseTime":2}
```

Variables de entorno relevantes:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | `error`, `warn`, `info`, `debug` | `info` |
| `LOG_FORMAT` | `pretty` (legible) o `json` (una línea JSON) | `pretty` en dev |

Cada request incluye `X-Correlation-ID` para trazabilidad end-to-end con el frontend.

### Backend (Datadog)

1. Crea una **API Key** en Datadog (Organization Settings → API Keys).
2. Agrega en `backend/.env`:
   ```env
   DD_API_KEY=tu_api_key
   DD_SITE=us5.datadoghq.com
   ```
3. Reinicia el backend. Los logs se envían a **Logs → Explorer** con `service:loyalty-app-api`.

Sin `DD_API_KEY`, los logs solo aparecen en la terminal (stdout).

### Frontend (Datadog Browser Logs)

El frontend envía eventos de negocio (`LOGIN_SUCCESS`, `USER_REGISTERED`, etc.) a Datadog vía `@datadog/browser-logs`. Se inicializa en `frontend/src/lib/datadog.ts` al abrir la app.

Opcional en `frontend/.env`:

```env
VITE_DATADOG_CLIENT_TOKEN=tu_client_token
```

Ver logs en Datadog: **Logs → Explorer**, filtrar por `@service:loyalty-app-api` (backend) o por el sitio Browser Logs (frontend).

---

##  Autenticación

La API usa **JWT (Bearer Token)**. Para acceder a rutas protegidas incluir el header:

```
Authorization: Bearer <token>
```

El token se obtiene al hacer login en `POST /api/auth/login`. No se requiere acceso especial — cualquiera puede registrarse desde el frontend en `/register`.

---

## 📡 Endpoints

### Auth
| Método | Ruta | Descripción | Auth requerido |
|--------|------|-------------|----------------|
| POST | `/api/auth/register` | Crear cuenta nueva | No |
| POST | `/api/auth/login` | Iniciar sesión, devuelve JWT | No |
| GET  | `/api/auth/me` | Info del usuario autenticado | Sí |
| POST | `/api/auth/forgot-password` | Solicitar token de recuperación de contraseña | No |
| POST | `/api/auth/reset-password` | Restablecer contraseña con token | No |

### Puntos
| Método | Ruta | Descripción | Auth requerido |
|--------|------|-------------|----------------|
| GET  | `/api/points/balance` | Ver saldo y nivel de la tarjeta | Sí |
| POST | `/api/points/add` | Agregar puntos (simular scan) | Sí |

### Recompensas
| Método | Ruta | Descripción | Auth requerido |
|--------|------|-------------|----------------|
| GET  | `/api/rewards` | Listar recompensas disponibles | Sí |
| POST | `/api/rewards/redeem` | Canjear una recompensa | Sí |

### Tiendas
| Método | Ruta | Descripción | Auth requerido |
|--------|------|-------------|----------------|
| GET | `/api/stores` | Listar tiendas participantes | Sí |

---

##  Equipo

> Elena Isabel Espriella Bustamante - Adrian Moises Martinez Hernandez - Frida Julieta Gonzalez Mena
