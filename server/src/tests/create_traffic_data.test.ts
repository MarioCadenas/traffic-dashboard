
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trafficDataTable } from '../db/schema';
import { type CreateTrafficDataInput } from '../schema';
import { createTrafficData } from '../handlers/create_traffic_data';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateTrafficDataInput = {
  date: new Date('2024-01-15'),
  page_views: 1500,
  unique_visitors: 850,
  bounce_rate: 45.25,
  direct_traffic: 300,
  organic_search: 600,
  referral_traffic: 150,
  social_traffic: 450
};

describe('createTrafficData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create traffic data', async () => {
    const result = await createTrafficData(testInput);

    // Basic field validation
    expect(result.date).toEqual(testInput.date);
    expect(result.page_views).toEqual(1500);
    expect(result.unique_visitors).toEqual(850);
    expect(result.bounce_rate).toEqual(45.25);
    expect(typeof result.bounce_rate).toBe('number');
    expect(result.direct_traffic).toEqual(300);
    expect(result.organic_search).toEqual(600);
    expect(result.referral_traffic).toEqual(150);
    expect(result.social_traffic).toEqual(450);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save traffic data to database', async () => {
    const result = await createTrafficData(testInput);

    // Query database to verify record was saved
    const trafficData = await db.select()
      .from(trafficDataTable)
      .where(eq(trafficDataTable.id, result.id))
      .execute();

    expect(trafficData).toHaveLength(1);
    expect(new Date(trafficData[0].date)).toEqual(testInput.date);
    expect(trafficData[0].page_views).toEqual(1500);
    expect(trafficData[0].unique_visitors).toEqual(850);
    expect(parseFloat(trafficData[0].bounce_rate)).toEqual(45.25);
    expect(trafficData[0].direct_traffic).toEqual(300);
    expect(trafficData[0].organic_search).toEqual(600);
    expect(trafficData[0].referral_traffic).toEqual(150);
    expect(trafficData[0].social_traffic).toEqual(450);
    expect(trafficData[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle bounce rate with proper decimal precision', async () => {
    const precisionInput: CreateTrafficDataInput = {
      ...testInput,
      bounce_rate: 67.89
    };

    const result = await createTrafficData(precisionInput);

    expect(result.bounce_rate).toEqual(67.89);
    expect(typeof result.bounce_rate).toBe('number');

    // Verify precision is maintained in database
    const saved = await db.select()
      .from(trafficDataTable)
      .where(eq(trafficDataTable.id, result.id))
      .execute();

    expect(parseFloat(saved[0].bounce_rate)).toEqual(67.89);
  });

  it('should handle edge case bounce rates', async () => {
    const edgeCaseInput: CreateTrafficDataInput = {
      ...testInput,
      bounce_rate: 0
    };

    const result = await createTrafficData(edgeCaseInput);

    expect(result.bounce_rate).toEqual(0);
    expect(typeof result.bounce_rate).toBe('number');

    // Test maximum bounce rate
    const maxInput: CreateTrafficDataInput = {
      ...testInput,
      bounce_rate: 100
    };

    const maxResult = await createTrafficData(maxInput);
    expect(maxResult.bounce_rate).toEqual(100);
  });
});
