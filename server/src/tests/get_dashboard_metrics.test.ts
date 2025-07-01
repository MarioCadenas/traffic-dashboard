
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trafficDataTable } from '../db/schema';
import { type DateRangeInput } from '../schema';
import { getDashboardMetrics } from '../handlers/get_dashboard_metrics';

describe('getDashboardMetrics', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return dashboard metrics with empty data', async () => {
    const result = await getDashboardMetrics();

    expect(result.timeSeriesData).toEqual([]);
    expect(result.trafficSources.direct).toEqual(0);
    expect(result.trafficSources.organic_search).toEqual(0);
    expect(result.trafficSources.referral).toEqual(0);
    expect(result.trafficSources.social).toEqual(0);
    expect(result.totalPageViews).toEqual(0);
    expect(result.totalUniqueVisitors).toEqual(0);
    expect(result.averageBounceRate).toEqual(0);
  });

  it('should return aggregated dashboard metrics', async () => {
    // Create test traffic data
    await db.insert(trafficDataTable).values([
      {
        date: '2024-01-01',
        page_views: 1000,
        unique_visitors: 500,
        bounce_rate: '45.50',
        direct_traffic: 200,
        organic_search: 400,
        referral_traffic: 300,
        social_traffic: 100
      },
      {
        date: '2024-01-02',
        page_views: 1200,
        unique_visitors: 600,
        bounce_rate: '40.25',
        direct_traffic: 250,
        organic_search: 500,
        referral_traffic: 350,
        social_traffic: 100
      }
    ]).execute();

    const result = await getDashboardMetrics();

    // Check time series data (should be ordered by date desc)
    expect(result.timeSeriesData).toHaveLength(2);
    expect(result.timeSeriesData[0].date).toEqual('2024-01-02');
    expect(result.timeSeriesData[0].page_views).toEqual(1200);
    expect(result.timeSeriesData[0].unique_visitors).toEqual(600);
    expect(result.timeSeriesData[0].bounce_rate).toEqual(40.25);
    
    expect(result.timeSeriesData[1].date).toEqual('2024-01-01');
    expect(result.timeSeriesData[1].page_views).toEqual(1000);
    expect(result.timeSeriesData[1].unique_visitors).toEqual(500);
    expect(result.timeSeriesData[1].bounce_rate).toEqual(45.50);

    // Check traffic sources aggregation
    expect(result.trafficSources.direct).toEqual(450);
    expect(result.trafficSources.organic_search).toEqual(900);
    expect(result.trafficSources.referral).toEqual(650);
    expect(result.trafficSources.social).toEqual(200);

    // Check summary statistics
    expect(result.totalPageViews).toEqual(2200);
    expect(result.totalUniqueVisitors).toEqual(1100);
    expect(result.averageBounceRate).toBeCloseTo(42.875, 2);
  });

  it('should filter data by date range', async () => {
    // Create test data spanning multiple dates
    await db.insert(trafficDataTable).values([
      {
        date: '2024-01-01',
        page_views: 1000,
        unique_visitors: 500,
        bounce_rate: '45.00',
        direct_traffic: 200,
        organic_search: 400,
        referral_traffic: 300,
        social_traffic: 100
      },
      {
        date: '2024-01-15',
        page_views: 1200,
        unique_visitors: 600,
        bounce_rate: '40.00',
        direct_traffic: 250,
        organic_search: 500,
        referral_traffic: 350,
        social_traffic: 100
      },
      {
        date: '2024-02-01',
        page_views: 800,
        unique_visitors: 400,
        bounce_rate: '50.00',
        direct_traffic: 150,
        organic_search: 300,
        referral_traffic: 250,
        social_traffic: 100
      }
    ]).execute();

    const dateRange: DateRangeInput = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    };

    const result = await getDashboardMetrics(dateRange);

    // Should only include January data (2 records)
    expect(result.timeSeriesData).toHaveLength(2);
    expect(result.timeSeriesData.some(d => d.date === '2024-02-01')).toBe(false);
    
    // Verify filtered aggregations
    expect(result.totalPageViews).toEqual(2200); // 1000 + 1200
    expect(result.totalUniqueVisitors).toEqual(1100); // 500 + 600
    expect(result.trafficSources.direct).toEqual(450); // 200 + 250
  });

  it('should handle start date filter only', async () => {
    await db.insert(trafficDataTable).values([
      {
        date: '2024-01-01',
        page_views: 1000,
        unique_visitors: 500,
        bounce_rate: '45.00',
        direct_traffic: 200,
        organic_search: 400,
        referral_traffic: 300,
        social_traffic: 100
      },
      {
        date: '2024-01-10',
        page_views: 1200,
        unique_visitors: 600,
        bounce_rate: '40.00',
        direct_traffic: 250,
        organic_search: 500,
        referral_traffic: 350,
        social_traffic: 100
      }
    ]).execute();

    const dateRange: DateRangeInput = {
      startDate: new Date('2024-01-05')
    };

    const result = await getDashboardMetrics(dateRange);

    // Should only include data from 2024-01-05 onwards
    expect(result.timeSeriesData).toHaveLength(1);
    expect(result.timeSeriesData[0].date).toEqual('2024-01-10');
    expect(result.totalPageViews).toEqual(1200);
  });

  it('should handle numeric bounce rate conversion correctly', async () => {
    await db.insert(trafficDataTable).values({
      date: '2024-01-01',
      page_views: 1000,
      unique_visitors: 500,
      bounce_rate: '45.75', // Numeric stored as string
      direct_traffic: 200,
      organic_search: 400,
      referral_traffic: 300,
      social_traffic: 100
    }).execute();

    const result = await getDashboardMetrics();

    expect(typeof result.timeSeriesData[0].bounce_rate).toBe('number');
    expect(result.timeSeriesData[0].bounce_rate).toEqual(45.75);
    expect(result.averageBounceRate).toEqual(45.75);
  });
});
