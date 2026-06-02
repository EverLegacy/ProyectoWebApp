# PuntosApp 🎯

Aplicación web de tarjeta de puntos similar a Spin Premia / OXXO Premia. Los usuarios acumulan puntos al realizar compras en tiendas participantes y los canjean por recompensas.

---

## 👥 Equipo

> Elena Isabel Espriella Bustamante - Adrian Moises Martinez Hernandez - Frida Julieta Gonzalez Mena

## 🔗 Repositorio

> https://github.com/EverLegacy/ProyectoWebApp

---

## 🌐 Demo

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

### Acceso de prueba

| Campo | Valor |
|-------|-------|
| Email | email@email.com |
| Contraseña | root |

---

## 🏗️ Arquitectura del proyecto

```
loyalty-app/
├── frontend/       React + TypeScript (Vite)
│   └── src/
│       ├── components/     Navbar
│       ├── pages/          Login, Register, Dashboard, Rewards, Transactions
│       ├── hooks/          useAuth
│       ├── services/       axios API client
│       └── types/          TypeScript interfaces
└── backend/        Node.js + Express (REST API)
    └── src/
        ├── config/         PostgreSQL + MongoDB connections
        ├── controllers/    auth, points, rewards, stores
        ├── middleware/      JWT auth
        ├── models/
        │   ├── postgres/   schema.sql, seed.sql
        │   └── mongo/      ActivityLog, Notification, RewardCatalog,
        │                   UserSession, StoreAnalytics, AppConfig
        └── routes/         auth, points, rewards, stores
```

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript (Vite) |
| Backend | Node.js + Express |
| BD Relacional | PostgreSQL |
| BD No-Relacional | MongoDB |
| Autenticación | JWT (JSON Web Tokens) |

---

## 🗄️ Bases de datos

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

**Total: 12 tablas/colecciones** ✅

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

## 🚀 Cómo correr el proyecto

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
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=loyalty_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password
MONGO_URI=mongodb://localhost:27017/loyalty_logs
JWT_SECRET=secreto123
JWT_EXPIRES_IN=7d
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
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

---

## 🔐 Autenticación

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

## 👥 Equipo

> Elena Isabel Espriella Bustamante - Adrian Moises Martinez Hernandez - Frida Julieta Gonzalez Mena
