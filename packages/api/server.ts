import Fastify from 'fastify';
import { generateMongoPlan } from '../agents/llm/mongoPlanGenerator';
import { generatePostgresPlan } from '../agents/llm/generatePostgresPlan';
import { getAgent } from '../agents'; // <-- Import the agent factory
import { Provider } from '../types/modelType.type';
import dotenv from "dotenv";
import cors from '@fastify/cors'; 
const app = Fastify({ logger: true });
dotenv.config();
await app.register(cors, {
  origin: true,
});
interface RequestPayload {
  prompt: string;
  dbUrl: string;
  provider: Provider;
  model: string;
  apiKey?: string;
}

app.post<{ Body: RequestPayload }>('/analyze', async (req, res) => {
  const { prompt, dbUrl, provider, model, apiKey } = req.body;

  try {
    const AgentClass = await getAgent(dbUrl); // <-- Use the factory
    if (!AgentClass) {
      return res.status(400).send({ error: "No suitable agent found for the provided dbUrl" });
    }
    const agent = new AgentClass(dbUrl);
    const schema = await agent.introspect();

    const plan = await generateMongoPlan({
      prompt,
      provider,
      model,
      schema,
      apiKey: process.env[provider === "openai" ? "OPENAI_API_KEY" : "GOOGLE_GENERATIVE_AI_API_KEY"],
    });

    res.send({ plan });
  } catch (err: any) {
    res.status(500).send({ error: err.message });
  }
});

app.post<{ Body: RequestPayload }>('/execute', async (req, res) => {
  const { prompt, dbUrl, provider, model } = req.body;

  const geminiApiKey = req.headers['x-gemini-api-key'] as string | undefined;
  const openaiApiKey = req.headers['x-openai-api-key'] as string | undefined;
  const apiKey = provider === "gemini" ? geminiApiKey : openaiApiKey;

  try {
    const AgentClass = await getAgent(dbUrl);
    if (!AgentClass) {
      return res.status(400).send({ error: "No suitable agent found for the provided dbUrl" });
    }
    const agent = new AgentClass(dbUrl);
    const schema = await agent.introspect();
    app.log.info("Introspected schema:", schema);

    // Choose the correct plan generator based on agent type
    let plan;
    if (agent.constructor.name === "MongoAgent") {
      plan = await generateMongoPlan({
        prompt,
        provider,
        model,
        schema,
        apiKey,
      });
    } else if (agent.constructor.name === "PostgresAgent") {
      plan = await generatePostgresPlan({
        prompt,
        provider,
        model,
        schema,
        apiKey,
      });
    } else {
      return res.status(400).send({ error: "Unsupported database agent" });
    }

    if (!agent.validate(plan)) {
      return res.status(400).send({ error: 'Invalid plan structure' });
    }

    const result = await agent.execute(plan);
    res.send({ plan, result });

  } catch (err: any) {
    res.status(500).send({ error: err?.message });
  }
});

app.listen({ port: 3001 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});


