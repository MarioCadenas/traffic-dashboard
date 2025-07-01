
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { TrafficMetrics } from '@/components/TrafficMetrics';
import { TrafficCharts } from '@/components/TrafficCharts';
import type { DashboardMetrics } from '../../server/src/schema';

// Fallback data for demonstration when API is unavailable
const getFallbackDashboardData = (): DashboardMetrics => {
  const timeSeriesData = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    timeSeriesData.push({
      date: date.toISOString().split('T')[0],
      page_views: Math.floor(Math.random() * 1000) + 500,
      unique_visitors: Math.floor(Math.random() * 400) + 200,
      bounce_rate: Math.floor(Math.random() * 40) + 30
    });
  }
  
  return {
    timeSeriesData,
    trafficSources: {
      direct: 3500,
      organic_search: 6200,
      referral: 1800,
      social: 900
    },
    totalPageViews: timeSeriesData.reduce((sum, day) => sum + day.page_views, 0),
    totalUniqueVisitors: timeSeriesData.reduce((sum, day) => sum + day.unique_visitors, 0),
    averageBounceRate: timeSeriesData.reduce((sum, day) => sum + day.bounce_rate, 0) / timeSeriesData.length
  };
};

function App() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getDashboardMetrics.query();
      setMetrics(result);
      setUsingFallbackData(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use fallback data for demonstration
      const fallbackData = getFallbackDashboardData();
      setMetrics(fallbackData);
      setUsingFallbackData(true);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const seedData = useCallback(async () => {
    try {
      await trpc.seedSampleData.mutate();
      // Reload data after seeding
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to seed data:', error);
      // If seeding fails, just refresh with fallback data
      await loadDashboardData();
    }
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading && !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📊 Traffic Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor your website's performance and visitor insights
              </p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdated.toLocaleString()}
                  {usingFallbackData && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      Offline Mode
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="space-x-2">
              <Button 
                onClick={seedData}
                variant="outline"
                className="bg-white hover:bg-gray-50"
              >
                🌱 Seed Sample Data
              </Button>
              <Button 
                onClick={loadDashboardData}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
              </Button>
            </div>
          </div>
        </div>

        {/* Alert for offline mode */}
        {usingFallbackData && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Offline Mode</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Unable to connect to the server. Displaying local data for demonstration purposes.
                </p>
              </div>
            </div>
          </div>
        )}

        {metrics ? (
          <div className="space-y-8">
            {/* Key Metrics Cards */}
            <TrafficMetrics metrics={metrics} />
            
            {/* Charts Section */}
            <TrafficCharts metrics={metrics} />
          </div>
        ) : (
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">No Data Available</CardTitle>
              <CardDescription>
                Get started by seeding some sample data to see your dashboard in action.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={seedData} className="bg-indigo-600 hover:bg-indigo-700">
                🌱 Generate Sample Data
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
