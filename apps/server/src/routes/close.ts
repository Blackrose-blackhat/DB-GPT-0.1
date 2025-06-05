// apps/server/src/routes/close.ts
import { FastifyInstance } from 'fastify';
import { closeAgent } from 'services/agentManager';

export async function closeRoute(app: FastifyInstance) {
  app.post('/close', async (req, res) => {
    const { dbUrl } = req.body as { dbUrl: string };
    try {
      await closeAgent(dbUrl);
      res.send({ success: true });
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  });
}
