
import { z } from 'zod';

// Traffic data schema
export const trafficDataSchema = z.object({
  id: z.number(),
  date: z.coerce.date(),
  page_views: z.number().int().nonnegative(),
  unique_visitors: z.number().int().nonnegative(),
  bounce_rate: z.number().min(0).max(100), // Percentage between 0-100
  direct_traffic: z.number().int().nonnegative(),
  organic_search: z.number().int().nonnegative(),
  referral_traffic: z.number().int().nonnegative(),
  social_traffic: z.number().int().nonnegative(),
  created_at: z.coerce.date()
});

export type TrafficData = z.infer<typeof trafficDataSchema>;

// Input schema for creating traffic data
export const createTrafficDataInputSchema = z.object({
  date: z.coerce.date(),
  page_views: z.number().int().nonnegative(),
  unique_visitors: z.number().int().nonnegative(),
  bounce_rate: z.number().min(0).max(100),
  direct_traffic: z.number().int().nonnegative(),
  organic_search: z.number().int().nonnegative(),
  referral_traffic: z.number().int().nonnegative(),
  social_traffic: z.number().int().nonnegative()
});

export type CreateTrafficDataInput = z.infer<typeof createTrafficDataInputSchema>;

// Dashboard metrics schema for aggregated data
export const dashboardMetricsSchema = z.object({
  timeSeriesData: z.array(z.object({
    date: z.string(), // ISO date string for easier chart consumption
    page_views: z.number(),
    unique_visitors: z.number(),
    bounce_rate: z.number()
  })),
  trafficSources: z.object({
    direct: z.number(),
    organic_search: z.number(),
    referral: z.number(),
    social: z.number()
  }),
  totalPageViews: z.number(),
  totalUniqueVisitors: z.number(),
  averageBounceRate: z.number()
});

export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;

// Date range input for filtering dashboard data
export const dateRangeInputSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional()
});

export type DateRangeInput = z.infer<typeof dateRangeInputSchema>;
