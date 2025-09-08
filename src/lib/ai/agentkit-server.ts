import { createServer } from '@inngest/agent-kit/server';
import { trainerAgents, createWorkoutNetwork } from './agentkit-trainers';
import { generateWorkoutAgentKit } from '@/inngest/functions/generate-workout-agentkit';

/**
 * AgentKit Server for FlexFlow Trainer Networks
 * 
 * This server hosts all 9 trainer agent networks and makes them available
 * for workout generation via HTTP endpoints and Inngest function integration.
 */

// Create networks for all trainers
const trainerNetworks = Object.keys(trainerAgents).map(coachId => 
  createWorkoutNetwork(coachId)
);

/**
 * Create and configure the AgentKit server
 */
export const agentKitServer = createServer({
  // Register all trainer networks
  networks: trainerNetworks,
  
  // Register the AgentKit workout generation function
  functions: [generateWorkoutAgentKit],
});

/**
 * Start the AgentKit server
 */
export function startAgentKitServer(port: number = 3010) {
  return new Promise<void>((resolve) => {
    agentKitServer.listen(port, () => {
      console.log(`🤖 AgentKit FlexFlow Trainer Server running on port ${port}`);
      console.log(`📋 Available trainer networks:`);
      
      Object.keys(trainerAgents).forEach(coachId => {
        console.log(`   - ${coachId} Trainer Agent`);
      });
      
      console.log(`🔄 Inngest functions registered:`);
      console.log(`   - generate-workout-agentkit`);
      
      resolve();
    });
  });
}

/**
 * Health check endpoint for monitoring
 */
export function getServerStatus() {
  return {
    status: 'healthy',
    trainerAgents: Object.keys(trainerAgents),
    networksCount: trainerNetworks.length,
    timestamp: new Date().toISOString(),
  };
}