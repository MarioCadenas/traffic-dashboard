
import { db } from '../db';
import { trafficDataTable } from '../db/schema';
import { type TrafficData, type DateRangeInput } from '../schema';
import { and, gte, lte, desc, SQL } from 'drizzle-orm';

export async function getTrafficData(input?: DateRangeInput): Promise<TrafficData[]> {
  try {
    // Build conditions array for date filtering
    const conditions: SQL<unknown>[] = [];

    if (input?.startDate) {
      conditions.push(gte(trafficDataTable.date, input.startDate.toISOString().split('T')[0]));
    }

    if (input?.endDate) {
      conditions.push(lte(trafficDataTable.date, input.endDate.toISOString().split('T')[0]));
    }

    // Build the complete query
    const results = conditions.length > 0
      ? await db.select()
          .from(trafficDataTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .orderBy(desc(trafficDataTable.date))
          .execute()
      : await db.select()
          .from(trafficDataTable)
          .orderBy(desc(trafficDataTable.date))
          .execute();

    // Convert numeric fields back to numbers for bounce_rate
    return results.map(result => ({
      ...result,
      bounce_rate: parseFloat(result.bounce_rate), // Convert numeric to number
      date: new Date(result.date), // Ensure date is proper Date object
    }));
  } catch (error) {
    console.error('Failed to fetch traffic data:', error);
    throw error;
  }
}
