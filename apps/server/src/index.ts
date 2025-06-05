// apps/server/src/index.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { registerRoutes } from 'routes';


dotenv.config();

const app = Fastify({ logger: true });

async function startServer() {
  await app.register(cors, { origin: true });
  registerRoutes(app);

  try {
    await app.listen({ port: 3001 });
   app.log.info(`Server listening on http://localhost:3001`);
  } catch (err) {
   app.log.error(err);
    process.exit(1);
  }
}

startServer();
