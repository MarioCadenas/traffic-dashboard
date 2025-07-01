
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardMetrics } from '../../../server/src/schema';

interface TrafficMetricsProps {
  metrics: DashboardMetrics;
}

export function TrafficMetrics({ metrics }: TrafficMetricsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const totalTrafficSources = 
    metrics.trafficSources.direct + 
    metrics.trafficSources.organic_search + 
    metrics.trafficSources.referral + 
    metrics.trafficSources.social;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Page Views */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Page Views
          </CardTitle>
          <div className="text-2xl">📈</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(metrics.totalPageViews)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Last 30 days
          </p>
        </CardContent>
      </Card>

      {/* Total Unique Visitors */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Unique Visitors
          </CardTitle>
          <div className="text-2xl">👥</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(metrics.totalUniqueVisitors)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Last 30 days
          </p>
        </CardContent>
      </Card>

      {/* Average Bounce Rate */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Avg. Bounce Rate
          </CardTitle>
          <div className="text-2xl">⚡</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.averageBounceRate.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Lower is better
          </p>
        </CardContent>
      </Card>

      {/* Total Traffic Sources */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Sessions
          </CardTitle>
          <div className="text-2xl">🌐</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(totalTrafficSources)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            All traffic sources
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
