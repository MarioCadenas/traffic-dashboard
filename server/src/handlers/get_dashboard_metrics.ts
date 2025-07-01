
import { db } from '../db';
import { trafficDataTable } from '../db/schema';
import { type DashboardMetrics, type DateRangeInput } from '../schema';
import { gte, lte, and, desc } from 'drizzle-orm';
import { SQL } from 'drizzle-orm';

export async function getDashboardMetrics(input?: DateRangeInput): Promise<DashboardMetrics> {
  try {
    // Build conditions array
    const conditions: SQL<unknown>[] = [];
    
    if (input?.startDate) {
      conditions.push(gte(trafficDataTable.date, input.startDate.toISOString().split('T')[0]));
    }
    
    if (input?.endDate) {
      conditions.push(lte(trafficDataTable.date, input.endDate.toISOString().split('T')[0]));
    }

    // Build and execute query in a single chain without reassignment
    const trafficData = conditions.length > 0
      ? await db.select()
          .from(trafficDataTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .orderBy(desc(trafficDataTable.date))
          .execute()
      : await db.select()
          .from(trafficDataTable)
          .orderBy(desc(trafficDataTable.date))
          .execute();

    // Convert numeric fields and prepare time series data
    const timeSeriesData = trafficData.map(row => ({
      date: row.date, // Already a string in YYYY-MM-DD format from date column
      page_views: row.page_views,
      unique_visitors: row.unique_visitors,
      bounce_rate: parseFloat(row.bounce_rate) // Convert numeric to number
    }));

    // Calculate traffic sources totals
    const trafficSources = {
      direct: trafficData.reduce((sum, row) => sum + row.direct_traffic, 0),
      organic_search: trafficData.reduce((sum, row) => sum + row.organic_search, 0),
      referral: trafficData.reduce((sum, row) => sum + row.referral_traffic, 0),
      social: trafficData.reduce((sum, row) => sum + row.social_traffic, 0)
    };

    // Calculate summary statistics
    const totalPageViews = trafficData.reduce((sum, row) => sum + row.page_views, 0);
    const totalUniqueVisitors = trafficData.reduce((sum, row) => sum + row.unique_visitors, 0);
    const averageBounceRate = trafficData.length > 0 
      ? trafficData.reduce((sum, row) => sum + parseFloat(row.bounce_rate), 0) / trafficData.length
      : 0;

    return {
      timeSeriesData,
      trafficSources,
      totalPageViews,
      totalUniqueVisitors,
      averageBounceRate
    };
  } catch (error) {
    console.error('Dashboard metrics retrieval failed:', error);
    throw error;
  }
}
