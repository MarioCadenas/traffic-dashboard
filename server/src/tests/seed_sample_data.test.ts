
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trafficDataTable } from '../db/schema';
import { seedSampleData } from '../handlers/seed_sample_data';
import { gte, lte, and, desc } from 'drizzle-orm';

describe('seedSampleData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should seed sample data successfully', async () => {
    const result = await seedSampleData();

    // Verify return message and count
    expect(result.message).toEqual('Sample traffic data has been seeded successfully');
    expect(result.recordsCreated).toEqual(60);
  });

  it('should insert correct number of records into database', async () => {
    await seedSampleData();

    // Query all records from database
    const records = await db.select()
      .from(trafficDataTable)
      .execute();

    expect(records).toHaveLength(60);
  });

  it('should create records with valid data structure', async () => {
    await seedSampleData();

    // Get one record to verify structure
    const records = await db.select()
      .from(trafficDataTable)
      .limit(1)
      .execute();

    const record = records[0];
    
    // Verify all required fields exist and have correct types
    expect(record.id).toBeDefined();
    expect(record.date).toBeDefined();
    expect(typeof record.page_views).toBe('number');
    expect(typeof record.unique_visitors).toBe('number');
    expect(typeof record.bounce_rate).toBe('string'); // Numeric column stored as string
    expect(typeof record.direct_traffic).toBe('number');
    expect(typeof record.organic_search).toBe('number');
    expect(typeof record.referral_traffic).toBe('number');
    expect(typeof record.social_traffic).toBe('number');
    expect(record.created_at).toBeInstanceOf(Date);
  });

  it('should create records with realistic traffic values', async () => {
    await seedSampleData();

    const records = await db.select()
      .from(trafficDataTable)
      .execute();

    // Verify traffic data is within realistic ranges
    records.forEach(record => {
      expect(record.page_views).toBeGreaterThan(0);
      expect(record.unique_visitors).toBeGreaterThan(0);
      expect(record.unique_visitors).toBeLessThanOrEqual(record.page_views);
      
      const bounceRate = parseFloat(record.bounce_rate);
      expect(bounceRate).toBeGreaterThanOrEqual(0);
      expect(bounceRate).toBeLessThanOrEqual(100);
      
      expect(record.direct_traffic).toBeGreaterThanOrEqual(0);
      expect(record.organic_search).toBeGreaterThanOrEqual(0);
      expect(record.referral_traffic).toBeGreaterThanOrEqual(0);
      expect(record.social_traffic).toBeGreaterThanOrEqual(0);
    });
  });

  it('should create records spanning 60 days in the past', async () => {
    await seedSampleData();

    // Get date range of created records
    const records = await db.select()
      .from(trafficDataTable)
      .orderBy(desc(trafficDataTable.date))
      .execute();

    const newestRecord = records[0];
    const oldestRecord = records[records.length - 1];

    // Convert date strings to Date objects for comparison
    const newestDate = new Date(newestRecord.date);
    const oldestDate = new Date(oldestRecord.date);
    const today = new Date();
    
    // Should span approximately 60 days
    const daysDifference = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDifference).toBe(59); // 60 days = 59 day difference
    
    // Newest record should be recent (within last few days)
    const daysFromToday = Math.ceil((today.getTime() - newestDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysFromToday).toBeLessThanOrEqual(2); // Allow for some variation
  });

  it('should handle traffic source distribution correctly', async () => {
    await seedSampleData();

    const records = await db.select()
      .from(trafficDataTable)
      .execute();

    // Verify traffic sources are reasonable and non-negative
    records.forEach(record => {
      const totalSources = record.direct_traffic + record.organic_search + 
                          record.referral_traffic + record.social_traffic;
      
      // Sources should be within reasonable range of page views (allow up to 20% variance due to rounding)
      const difference = Math.abs(totalSources - record.page_views);
      const percentageDiff = (difference / record.page_views) * 100;
      expect(percentageDiff).toBeLessThan(20);
      
      // Each source should be a reasonable percentage of total page views
      expect(record.direct_traffic / record.page_views).toBeLessThan(0.6); // Less than 60%
      expect(record.organic_search / record.page_views).toBeLessThan(0.6); // Less than 60%
      expect(record.referral_traffic / record.page_views).toBeLessThan(0.3); // Less than 30%
      expect(record.social_traffic / record.page_views).toBeLessThan(0.3); // Less than 30%
    });
  });
});
