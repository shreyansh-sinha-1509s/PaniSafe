import app from '../backend/src/server.js';
import { dataService } from '../backend/src/services/dataService.js';

export default async function handler(req, res) {
  // Ensure data service is initialized (cached in memory across serverless invocations)
  if (!dataService.isLoaded) {
    try {
      dataService.init();
    } catch (err) {
      console.error('[VERCEL SERVERLESS INIT ERROR]', err);
    }
  }

  // Forward to Express application
  return app(req, res);
}
