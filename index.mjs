import env from './config/prod.env.js';

Object.keys(env).forEach((key) => {
  if (!process.env[key]) {
    process.env[key] = JSON.parse(env[key]);
  }
});

import http from 'http';
import express from 'express';
import server from './server/index.mjs';

const app = express();

server(app);

const port = parseInt(process.env.PORT || 8080, 10);
const httpServer = http.createServer(app);
httpServer.listen(port, null, () => {
  console.log(`HTTP server started: http://localhost:${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  httpServer.close(() => {
    process.exit(0);
  });
});
