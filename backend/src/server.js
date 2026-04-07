import app from './app.js';
import http from 'node:http';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './services/socket.service.js';

async function startServer() {
  await connectDatabase();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

try {
  await startServer();
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
