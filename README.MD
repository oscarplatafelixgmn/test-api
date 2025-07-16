# 🌐 API de Validación de Conexiones - GCP Ready (Node.js + Sequelize)

Esta API permite:

- Validar conexiones a bases de datos SQL Server usando Sequelize.
- Realizar solicitudes HTTP a servicios externos (API test).
- Documentación con Swagger.

---

## 📦 Tecnologías

- Node.js `v22.15.0`
- Express
- Sequelize
- Swagger JSDoc
- Docker

---

## 📄 Swagger

Documentación interactiva disponible en:

```
http://localhost:8080/api-docs
```

---

## 🚀 Endpoints disponibles

### `GET /api/status`

Verifica si la API está en línea.

**Respuesta:**
```json
{
  "status": "ok",
  "message": "API de Node.js está en línea."
}
```

---

### `POST /api/test-db-connection`

Valida una conexión a SQL Server mediante Sequelize.

**Cuerpo JSON requerido:**
```json
{
  "host": "127.0.0.1",
  "port": 1433,
  "database": "nombreBD",
  "username": "usuario",
  "password": "clave",
  "dialect": "mssql"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Conexión exitosa a la base de datos"
}
```

---

### `POST /api/test-api-connection`

Realiza una solicitud HTTP a una URL externa.

**Cuerpo JSON requerido:**
```json
{
  "url": "https://jsonplaceholder.typicode.com/posts/1",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token"
  },
  "body": {
    "key": "value"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "status": 200,
  "data": { ... }
}
```

---

## 🧪 Uso Local

### Requisitos

- Node.js `v22.15.0`
- Docker (opcional)

### Instalación

```bash
npm install
```

### Ejecución local

```bash
npm run dev
```

---

## 🐳 Uso con Docker

### Crear imagen

```bash
docker build -t cadena-app .
```

### Ejecutar contenedor

```bash
docker run -p 8080:8080 \
  -e SERVER_URL=https://tudominio.com/api \
  cadena-app
```

> Usa `--env-file .env` si prefieres variables desde archivo `.env`.

---

## ⚙️ Variables de Entorno

| Variable       | Descripción                           |
|----------------|----------------------------------------|
| `PORT`         | Puerto en el que escucha la API (por defecto `8080`) |
| `SERVER_URL`   | URL pública del servidor (Swagger)     |

Ejemplo `.env`:

```env
PORT=8080
SERVER_URL=https://cadena-api.tudominio.com/api
```

---

## 📁 Estructura del Proyecto

```
├── index.js              # API principal
├── Dockerfile            # Imagen para producción
├── .nvmrc                # Versión de Node recomendada
├── README.md             # Documentación
└── ...
```

---

## 🔒 Licencia

MIT © Oscar Plata - GamanSolutions
