const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

dotenv.config();

// Initialize express app
const app = express();

/**
 * CORS configuration:
 * - If CORS_ORIGIN is set, use that exact origin.
 * - Otherwise, reflect the request's Origin header to support the current frontend host.
 */
const allowOrigin = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.trim() !== ''
  ? process.env.CORS_ORIGIN.trim()
  : true; // reflect request origin

app.use((req, res, next) => {
  res.header('Vary', 'Origin');
  next();
});

app.use(cors({
  origin: allowOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 204
}));

// Handle preflight quickly
app.options('*', cors());

app.set('trust proxy', true);

// OpenAPI JSON endpoint
app.get('/openapi.json', (req, res) => {
  const host = req.get('host');
  let protocol = req.protocol;
  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');
  const needsPort = !hasPort && ((protocol === 'http' && actualPort !== 80) || (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;
  return res.json({
    ...swaggerSpec,
    servers: [{ url: `${protocol}://${fullHost}` }],
  });
});

app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');
  let protocol = req.protocol;
  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
     (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

// Mount routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack || err);
  }
  res.status(status).json({
    success: false,
    message,
  });
});

module.exports = app;
