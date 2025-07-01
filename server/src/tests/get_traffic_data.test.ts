
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trafficDataTable } from '../db/schema';
import { type CreateTrafficDataInput, type DateRangeInput } from '../schema';
import { getTrafficData } from '../handlers/get_traffic_data';

// Test data
const testTrafficData: CreateTrafficDataInput[] = [
  {
    date: new Date('2024-01-01'),
    page_views: 1000,
    unique_visitors: 800,
    bounce_rate: 45.5,
    direct_traffic: 400,
    organic_search: 300,
    referral_traffic: 200,
    social_traffic: 100
  },
  {
    date: new Date('2024-01-02'),
    page_views: 1200,
    unique_visitors: 950,
    bounce_rate: 42.3,
    direct_traffic: 450,
    organic_search: 350,
    referral_traffic: 250,
    social_traffic: 150
  },
  {
    date: new Date('2024-01-03'),
    page_views: 900,
    unique_visitors: 700,
    bounce_rate: 48.7,
    direct_traffic: 350,
    organic_search: 280,
    referral_traffic: 180,
    social_traffic: 90
  }
];

describe('getTrafficData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all traffic data when no filters provided', async () => {
    // Insert test data
    await db.insert(trafficDataTable).values(
      testTrafficData.map(data => ({
        ...data,
        bounce_rate: data.bounce_rate.toString(), // Convert to string for numeric column
        date: data.date.toISOString().split('T')[0] // Convert to date string
      }))
    ).execute();

    const results = await getTrafficData();

    expect(results).toHaveLength(3);
    
    // Should be ordered by date descending (most recent first)
    expect(results[0].date).toEqual(new Date('2024-01-03'));
    expect(results[1].date).toEqual(new Date('2024-01-02'));
    expect(results[2].date).toEqual(new Date('2024-01-01'));

    // Check numeric conversion
    expect(typeof results[0].bounce_rate).toBe('number');
    expect(results[0].bounce_rate).toEqual(48.7);
    
    // Check all fields are present
    expect(results[0].page_views).toEqual(900);
    expect(results[0].unique_visitors).toEqual(700);
    expect(results[0].direct_traffic).toEqual(350);
    expect(results[0].organic_search).toEqual(280);
    expect(results[0].referral_traffic).toEqual(180);
    expect(results[0].social_traffic).toEqual(90);
    expect(results[0].id).toBeDefined();
    expect(results[0].created_at).toBeInstanceOf(Date);
  });

  it('should filter by start date', async () => {
    // Insert test data
    await db.insert(trafficDataTable).values(
      testTrafficData.map(data => ({
        ...data,
        bounce_rate: data.bounce_rate.toString(),
        date: data.date.toISOString().split('T')[0]
      }))
    ).execute();

    const dateRange: DateRangeInput = {
      startDate: new Date('2024-01-02')
    };

    const results = await getTrafficData(dateRange);

    expect(results).toHaveLength(2);
    expect(results[0].date).toEqual(new Date('2024-01-03'));
    expect(results[1].date).toEqual(new Date('2024-01-02'));
  });

  it('should filter by end date', async () => {
    // Insert test data
    await db.insert(trafficDataTable).values(
      testTrafficData.map(data => ({
        ...data,
        bounce_rate: data.bounce_rate.toString(),
        date: data.date.toISOString().split('T')[0]
      }))
    ).execute();

    const dateRange: DateRangeInput = {
      endDate: new Date('2024-01-02')
    };

    const results = await getTrafficData(dateRange);

    expect(results).toHaveLength(2);
    expect(results[0].date).toEqual(new Date('2024-01-02'));
    expect(results[1].date).toEqual(new Date('2024-01-01'));
  });

  it('should filter by date range', async () => {
    // Insert test data
    await db.insert(trafficDataTable).values(
      testTrafficData.map(data => ({
        ...data,
        bounce_rate: data.bounce_rate.toString(),
        date: data.date.toISOString().split('T')[0]
      }))
    ).execute();

    const dateRange: DateRangeInput = {
      startDate: new Date('2024-01-02'),
      endDate: new Date('2024-01-02')
    };

    const results = await getTrafficData(dateRange);

    expect(results).toHaveLength(1);
    expect(results[0].date).toEqual(new Date('2024-01-02'));
    expect(results[0].page_views).toEqual(1200);
    expect(results[0].bounce_rate).toEqual(42.3);
  });

  it('should return empty array when no data matches filters', async () => {
    // Insert test data
    await db.insert(trafficDataTable).values(
      testTrafficData.map(data => ({
        ...data,
        bounce_rate: data.bounce_rate.toString(),
        date: data.date.toISOString().split('T')[0]
      }))
    ).execute();

    const dateRange: DateRangeInput = {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-28')
    };

    const results = await getTrafficData(dateRange);

    expect(results).toHaveLength(0);
  });

  it('should return empty array when no data exists', async () => {
    const results = await getTrafficData();

    expect(results).toHaveLength(0);
  });
});
