# Asistencia App - Backend (NestJS)

Backend para gestion de asistencia con QR dinamico y validacion por geocerca por sesion.

## Base URL

- Prefijo global: `/api`
- Ejemplo local: `http://localhost:3000/api`

## Requisitos

- Node.js + npm
- Postgres (este proyecto espera DB en puerto `5433`)

## Setup local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` desde `.env.example`.

3. Levantar base de datos:

```bash
docker-compose up -d
```

4. Ejecutar backend:

```bash
npm run start:dev
```

## Scripts utiles

- `npm run build`: compila proyecto
- `npm run test`: tests unitarios
- `npm run test:e2e`: tests e2e

## Roles y seguridad de endpoints

Se usa `@Auth(...)` con JWT para proteger endpoints.

### Attendance Sessions (`/api/attendance-sessions`)

- `POST /` -> `teacher`, `admin`
- `GET /` -> `teacher`, `admin`
- `GET /:id` -> `teacher`, `admin`
- `GET /:id/qr-token` -> `teacher`, `admin`
- `PATCH /:id` -> `teacher`, `admin`
- `PATCH /:id/close` -> `teacher`, `admin`
- `DELETE /:id` -> `admin`

### Attendances (`/api/attendances`)

- `POST /scan` -> `student` (requiere JWT de estudiante)

### Classes (`/api/classes`)

- `POST /` -> `teacher`, `admin`
- `GET /` -> `teacher`, `admin`
- `GET /:id` -> `teacher`, `admin`

### Enrollments (`/api/enrollments`)

- `POST /` -> `teacher`, `admin`
- `GET /` -> `teacher`, `admin`
- `GET /:id` -> `teacher`, `admin`
- `PATCH /:id` -> `admin`
- `DELETE /:id` -> `admin`

## Flujo funcional recomendado (QR + geocerca)

1. Crear clase (`/api/classes`).
2. Inscribir alumno activo al curso (`/api/enrollments`).
3. Abrir sesion de asistencia con geocerca (`/api/attendance-sessions`).
4. Solicitar QR dinamico (`/api/attendance-sessions/:id/qr-token`).
5. Estudiante escanea y marca (`/api/attendances/scan`) enviando:
   - `Authorization: Bearer <jwt_estudiante>`
   - body con `qrToken`, `lat`, `lng`.

## Como funciona el QR dinamico

- El endpoint `GET /attendance-sessions/:id/qr-token` genera un token efimero JWT.
- El token tiene expiracion corta (por defecto `10s`) y payload de sesion/clase.
- El frontend del docente debe pedir un nuevo token periodicamente y regenerar el QR.

## Geocerca por sesion

Cada sesion guarda:

- `geoLat`
- `geoLng`
- `geoRadiusMeters` (default `120`)

Al escanear, backend calcula distancia (Haversine) entre ubicacion del estudiante y centro de geocerca.
Si esta fuera del radio, rechaza el marcado.

## Bodies de ejemplo (Postman)

### Crear clase

`POST /api/classes`

```json
{
  "courseId": "UUID_DEL_CURSO",
  "createdById": "UUID_DEL_TEACHER_O_ADMIN",
  "title": "Clase 1 - Introduccion",
  "topic": "Presentacion del curso",
  "classDate": "2026-04-17T00:00:00.000Z",
  "startTime": "08:00",
  "endTime": "09:30",
  "status": "scheduled"
}
```

### Crear enrollment

`POST /api/enrollments`

```json
{
  "studentId": "UUID_DEL_STUDENT",
  "courseId": "UUID_DEL_CURSO",
  "status": "active"
}
```

### Crear sesion de asistencia

`POST /api/attendance-sessions`

```json
{
  "classId": "UUID_DE_LA_CLASE",
  "geoLat": -12.0464,
  "geoLng": -77.0428,
  "geoRadiusMeters": 120,
  "qrRotationSeconds": 10,
  "durationMinutes": 60
}
```

### Marcar asistencia por scan

`POST /api/attendances/scan`

```json
{
  "qrToken": "TOKEN_DEVUELTO_POR_/attendance-sessions/:id/qr-token",
  "lat": -12.04645,
  "lng": -77.04279,
  "validationNotes": "Marcado desde app movil"
}
```

## Notas importantes

- Usa UUID de `attendance_sessions.id` para `:id/qr-token`.
- No usar `classId` en `:id/qr-token`.
- `401` en `scan` normalmente significa JWT de estudiante ausente/invalido.
- `400` en `scan` puede ser QR expirado o fuera de geocerca.
