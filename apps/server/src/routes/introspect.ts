// apps/server/src/routes/introspect.ts
import { FastifyInstance } from 'fastify';
import { getAgentInstance } from 'services/agentManager';

export async function introspectRoute(app: FastifyInstance) {
  app.post('/introspect', async (req: any, res) => {
    const { dbUrl } = req.body;
    try {
      const agent = await getAgentInstance(dbUrl);
      const schema = await agent.introspect();
      res.send({ schema });
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  });
}
