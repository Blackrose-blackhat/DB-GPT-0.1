import Fastify from 'fastify';
import { generateMongoPlan } from '../agents/llm';
import { MongoAgent } from '../agents/mongo';
import { Provider } from '../types/modelType.type';
import dotenv from "dotenv";
import cors from '@fastify/cors'; 
const app = Fastify({ logger: true });
dotenv.config();
await app.register(cors, {
  origin: true, // Allow all origins
});
interface RequestPayload {
  prompt: string;
  dbUrl: string;
  provider: Provider;
  model: string;
  apiKey?: string; // Optional API key for LLM provider
}

app.post<{ Body: RequestPayload }>('/analyze', async (req, res) => {
  const { prompt, dbUrl, provider, model,apiKey } = req.body;

  try {
    const agent = new MongoAgent(dbUrl);
    const schema = await agent.introspect();

    const plan = await generateMongoPlan({
      prompt,
      provider,
      model,
      schema, // 👈 pass the schema to guide LLM
      apiKey: process.env[provider === "openai" ? "OPENAI_API_KEY" : "GOOGLE_GENERATIVE_AI_API_KEY"],
    });

    res.send({ plan });
  } catch (err: any) {
    res.status(500).send({ error: err.message });
  }
});

app.post<{ Body: RequestPayload }>('/execute', async (req, res) => {
  const { prompt, dbUrl, provider, model } = req.body;

  // Get API key from headers
  const geminiApiKey = req.headers['x-gemini-api-key'] as string | undefined;
  const openaiApiKey = req.headers['x-openai-api-key'] as string | undefined;
  const apiKey = provider === "gemini" ? geminiApiKey : openaiApiKey;

  try {
    const agent = new MongoAgent(dbUrl);
    const schema = await agent.introspect();
    app.log.info("Introspected schema:", schema);

    const plan = await generateMongoPlan({
      prompt,
      provider,
      model,
      schema,
      apiKey, // Pass the user-supplied API key here
    });

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


