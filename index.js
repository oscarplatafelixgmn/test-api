// Asegura fetch global en Node.js si no existe
if (typeof fetch === 'undefined') {
  global.fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
}
const express = require('express');
const { Sequelize } = require('sequelize');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const app = express();
const port = process.env.PORT || 8080;

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de prueba GCP',
    version: '1.0.0',
    description: 'API para validar la conexión a una base de datos SQL Server usando Sequelize.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
    {
      url: process.env.SERVER_URL || 'https://tu-dominio.com/api',
      description: 'Servidor GCP - ENV SERVER_URL',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [__filename],
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Hola desde Cloud Run con Node.js! Tu API está funcionando.');
});

/**
 * @openapi
 * /api/status:
 *   get:
 *     summary: Verifica el estado de la API
 *     responses:
 *       200:
 *         description: La API está en línea
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: API de Node.js está en línea.
 */
app.get('/api/status', (_, res) => {
  res.json({ status: 'ok', message: 'API de Node.js está en línea.' });
});

/**
 * @openapi
 * /api/test-db-connection:
 *   post:
 *     summary: Valida conexión a la base de datos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - host
 *               - database
 *               - username
 *               - password
 *             properties:
 *               host:
 *                 type: string
 *               port:
 *                 type: integer
 *                 default: 1433
 *               database:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               dialect:
 *                 type: string
 *                 default: mssql
 *     responses:
 *       200:
 *         description: Conexión exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Faltan datos de conexión
 *       500:
 *         description: Error al conectar a la base de datos
 */
app.post('/api/test-db-connection', async (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'Faltan datos de conexión' });
  const { host, port, database, username, password, dialect = 'mssql' } = req.body;

  if (!host || !database || !username || !password) {
    return res.status(400).json({ error: 'Faltan datos de conexión' });
  }

  const sequelize = new Sequelize(database, username, password, {
    host,
    port: port || 1433,
    dialect,
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    },
    logging: false,
  });

  try {
    await sequelize.authenticate();
    await sequelize.close();
    res.json({ success: true, message: 'Conexión exitosa a la base de datos' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al conectar a la base de datos', error: error.message });
  }
});

/**
 * @openapi
 * /api/test-api-connection:
 *   post:
 *     summary: Realiza una solicitud HTTP a una URL dada para probar la conexión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://jsonplaceholder.typicode.com/posts/1
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, DELETE, PATCH]
 *                 default: GET
 *               headers:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *               body:
 *                 type: object
 *     responses:
 *       200:
 *         description: Respuesta de la API externa
 *       400:
 *         description: Faltan datos de conexión
 *       500:
 *         description: Error al conectar con la API externa
 */
app.post('/api/test-api-connection', async (req, res) => {
  const { url, method = 'GET', headers = {}, body = {} } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Falta la URL a probar' });
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    res.status(response.status).json({
      success: true,
      status: response.status,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`API de Node.js escuchando en el puerto ${port}`);
});