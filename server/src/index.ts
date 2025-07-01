
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas and handlers
import { 
  createTrafficDataInputSchema, 
  dateRangeInputSchema 
} from './schema';
import { createTrafficData } from './handlers/create_traffic_data';
import { getDashboardMetrics } from './handlers/get_dashboard_metrics';
import { getTrafficData } from './handlers/get_traffic_data';
import { seedSampleData } from './handlers/seed_sample_data';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create new traffic data entry
  createTrafficData: publicProcedure
    .input(createTrafficDataInputSchema)
    .mutation(({ input }) => createTrafficData(input)),
  
  // Get dashboard metrics with optional date range filtering
  getDashboardMetrics: publicProcedure
    .input(dateRangeInputSchema.optional())
    .query(({ input }) => getDashboardMetrics(input)),
  
  // Get raw traffic data with optional date range filtering
  getTrafficData: publicProcedure
    .input(dateRangeInputSchema.optional())
    .query(({ input }) => getTrafficData(input)),
  
  // Seed sample data for demonstration
  seedSampleData: publicProcedure
    .mutation(() => seedSampleData()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Traffic Dashboard TRPC server listening at port: ${port}`);
}

start();
