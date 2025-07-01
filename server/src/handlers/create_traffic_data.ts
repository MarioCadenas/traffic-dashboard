
import { db } from '../db';
import { trafficDataTable } from '../db/schema';
import { type CreateTrafficDataInput, type TrafficData } from '../schema';

export const createTrafficData = async (input: CreateTrafficDataInput): Promise<TrafficData> => {
  try {
    // Insert traffic data record
    const result = await db.insert(trafficDataTable)
      .values({
        date: input.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string for date column
        page_views: input.page_views,
        unique_visitors: input.unique_visitors,
        bounce_rate: input.bounce_rate.toString(), // Convert number to string for numeric column
        direct_traffic: input.direct_traffic,
        organic_search: input.organic_search,
        referral_traffic: input.referral_traffic,
        social_traffic: input.social_traffic
      })
      .returning()
      .execute();

    // Convert fields back to proper types before returning
    const trafficData = result[0];
    return {
      ...trafficData,
      date: new Date(trafficData.date), // Convert string back to Date
      bounce_rate: parseFloat(trafficData.bounce_rate) // Convert string back to number
    };
  } catch (error) {
    console.error('Traffic data creation failed:', error);
    throw error;
  }
};
