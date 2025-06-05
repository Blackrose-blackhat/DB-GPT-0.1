// apps/server/src/routes/execute.ts
import { FastifyInstance } from 'fastify';
import { getAgentInstance } from 'services/agentManager';
import { generatePlan } from 'services/planner';

export async function executeRoute(app: FastifyInstance) {
  app.post('/execute', async (req, res) => {
    const { prompt, dbUrl, provider, model, schema } = req.body as {
      prompt: string;
      dbUrl: string;
      provider: string;
      model: string;
      schema: any;
    };
    const geminiApiKey = req.headers['x-gemini-api-key'] as string;
    const openaiApiKey = req.headers['x-openai-api-key'] as string;
    const apiKey = provider === 'gemini' ? geminiApiKey : openaiApiKey;

    try {
      const agent = await getAgentInstance(dbUrl);
      const plan = await generatePlan(agent, { prompt, provider, model, schema, apiKey });
      if (!agent.validate(plan)) {
        return res.status(400).send({ error: 'Invalid plan structure' });
      }
      const result = await agent.execute(plan);
      res.send({ plan, result });
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  });
}
