// apps/server/src/services/planner.ts
import { generateMongoPlan } from '../../../../packages/agents/llm/mongoPlanGenerator';
import { generatePostgresPlan } from '../../../../packages/agents/llm/generatePostgresPlan';

export async function generatePlan(agent: any, props: any) {
  if (agent.constructor.name === 'MongoAgent') {
    return generateMongoPlan(props);
  } else if (agent.constructor.name === 'PostgresAgent') {
    return generatePostgresPlan(props);
  } else {
    throw new Error('Unsupported agent type');
  }
}
