// apps/server/src/routes/index.ts
import { FastifyInstance } from 'fastify';
import { introspectRoute } from './introspect';
import { executeRoute } from './execute';
import { closeRoute } from './close';

export function registerRoutes(app: FastifyInstance) {
  introspectRoute(app);
  executeRoute(app);
  closeRoute(app);
}
