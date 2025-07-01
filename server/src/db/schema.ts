
import { serial, text, pgTable, timestamp, integer, numeric, date } from 'drizzle-orm/pg-core';

export const trafficDataTable = pgTable('traffic_data', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(), // Date of the traffic data
  page_views: integer('page_views').notNull(),
  unique_visitors: integer('unique_visitors').notNull(),
  bounce_rate: numeric('bounce_rate', { precision: 5, scale: 2 }).notNull(), // Percentage with 2 decimal places
  direct_traffic: integer('direct_traffic').notNull(),
  organic_search: integer('organic_search').notNull(),
  referral_traffic: integer('referral_traffic').notNull(),
  social_traffic: integer('social_traffic').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type TrafficData = typeof trafficDataTable.$inferSelect;
export type NewTrafficData = typeof trafficDataTable.$inferInsert;

// Export all tables for proper query building
export const tables = { trafficData: trafficDataTable };
