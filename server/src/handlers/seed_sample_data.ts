
import { db } from '../db';
import { trafficDataTable } from '../db/schema';
import { type TrafficData } from '../schema';

export async function seedSampleData(): Promise<{ message: string; recordsCreated: number }> {
  try {
    // Generate sample data for the past 60 days
    const sampleData = generateSampleTrafficData(60);
    
    // Insert all records at once
    await db.insert(trafficDataTable)
      .values(sampleData.map(data => ({
        date: data.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string for date column
        page_views: data.page_views,
        unique_visitors: data.unique_visitors,
        bounce_rate: data.bounce_rate.toString(), // Convert number to string for numeric column
        direct_traffic: data.direct_traffic,
        organic_search: data.organic_search,
        referral_traffic: data.referral_traffic,
        social_traffic: data.social_traffic
      })))
      .execute();

    return {
      message: "Sample traffic data has been seeded successfully",
      recordsCreated: sampleData.length
    };
  } catch (error) {
    console.error('Sample data seeding failed:', error);
    throw error;
  }
}

function generateSampleTrafficData(days: number): Array<{
  date: Date;
  page_views: number;
  unique_visitors: number;
  bounce_rate: number;
  direct_traffic: number;
  organic_search: number;
  referral_traffic: number;
  social_traffic: number;
}> {
  const data = [];
  const baseDate = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() - i);
    
    // Simulate realistic traffic patterns
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const weekendMultiplier = isWeekend ? 0.7 : 1.0; // Lower traffic on weekends
    
    // Add some growth trend over time (slight increase as we approach current date)
    const growthMultiplier = 1 + (days - i) * 0.002; // 0.2% growth per day
    
    // Random variation (±20%)
    const randomMultiplier = 0.8 + Math.random() * 0.4;
    
    const totalMultiplier = weekendMultiplier * growthMultiplier * randomMultiplier;
    
    // Base traffic numbers
    const basePageViews = Math.floor(2500 * totalMultiplier);
    const baseUniqueVisitors = Math.floor(basePageViews * (0.6 + Math.random() * 0.2)); // 60-80% of page views
    
    // Traffic source distribution - calculate absolute values first
    const directTraffic = Math.floor(basePageViews * (0.35 + Math.random() * 0.1)); // 35-45%
    const organicSearch = Math.floor(basePageViews * (0.40 + Math.random() * 0.1)); // 40-50%
    const referralTraffic = Math.floor(basePageViews * (0.15 + Math.random() * 0.05)); // 15-20%
    
    // Calculate social traffic as remainder, ensuring it's non-negative
    const socialTraffic = Math.max(0, basePageViews - directTraffic - organicSearch - referralTraffic);
    
    data.push({
      date: currentDate,
      page_views: basePageViews,
      unique_visitors: baseUniqueVisitors,
      bounce_rate: Math.round((35 + Math.random() * 30) * 100) / 100, // 35-65% with 2 decimal places
      direct_traffic: directTraffic,
      organic_search: organicSearch,
      referral_traffic: referralTraffic,
      social_traffic: socialTraffic
    });
  }
  
  return data;
}
