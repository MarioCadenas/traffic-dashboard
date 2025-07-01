
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardMetrics } from '../../../server/src/schema';

interface TrafficChartsProps {
  metrics: DashboardMetrics;
}

export function TrafficCharts({ metrics }: TrafficChartsProps) {
  // Find min/max values for scaling
  const pageViewsMax = Math.max(...metrics.timeSeriesData.map(d => d.page_views));
  const uniqueVisitorsMax = Math.max(...metrics.timeSeriesData.map(d => d.unique_visitors));
  const bounceRateMax = Math.max(...metrics.timeSeriesData.map(d => d.bounce_rate));

  // Calculate traffic source percentages
  const totalTraffic = 
    metrics.trafficSources.direct + 
    metrics.trafficSources.organic_search + 
    metrics.trafficSources.referral + 
    metrics.trafficSources.social;

  const trafficSourcesData = [
    {
      name: 'Organic Search',
      value: metrics.trafficSources.organic_search,
      percentage: (metrics.trafficSources.organic_search / totalTraffic) * 100,
      color: 'bg-green-500',
      icon: '🔍'
    },
    {
      name: 'Direct',
      value: metrics.trafficSources.direct,
      percentage: (metrics.trafficSources.direct / totalTraffic) * 100,
      color: 'bg-blue-500',
      icon: '🌐'
    },
    {
      name: 'Referral',
      value: metrics.trafficSources.referral,
      percentage: (metrics.trafficSources.referral / totalTraffic) * 100,
      color: 'bg-purple-500',
      icon: '🔗'
    },
    {
      name: 'Social',
      value: metrics.trafficSources.social,
      percentage: (metrics.trafficSources.social / totalTraffic) * 100,
      color: 'bg-pink-500',
      icon: '📱'
    }
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Time Series Charts */}
      <div className="space-y-6">
        {/* Page Views Chart */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">📈 Page Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between space-x-1">
              {metrics.timeSeriesData.map((data, index) => {
                const height = (data.page_views / pageViewsMax) * 100;
                const date = new Date(data.date);
                return (
                  <div key={index} className="flex flex-col items-center group">
                    <div 
                      className="w-3 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {data.page_views.toLocaleString()}
                        <br />
                        {date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-sm text-gray-600 text-center">
              Last 30 days
            </div>
          </CardContent>
        </Card>

        {/* Unique Visitors Chart */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">👥 Unique Visitors Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between space-x-1">
              {metrics.timeSeriesData.map((data, index) => {
                const height = (data.unique_visitors / uniqueVisitorsMax) * 100;
                const date = new Date(data.date);
                return (
                  <div key={index} className="flex flex-col items-center group">
                    <div 
                      className="w-3 bg-green-500 rounded-t hover:bg-green-600 transition-colors relative"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {data.unique_visitors.toLocaleString()}
                        <br />
                        {date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-sm text-gray-600 text-center">
              Last 30 days
            </div>
          </CardContent>
        </Card>

        {/* Bounce Rate Chart */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">⚡ Bounce Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between space-x-1">
              {metrics.timeSeriesData.map((data, index) => {
                const height = (data.bounce_rate / bounceRateMax) * 100;
                const date = new Date(data.date);
                const color = data.bounce_rate > 60 ? 'bg-red-500' : data.bounce_rate > 40 ? 'bg-yellow-500' : 'bg-green-500';
                const hoverColor = data.bounce_rate > 60 ? 'hover:bg-red-600' : data.bounce_rate > 40 ? 'hover:bg-yellow-600' : 'hover:bg-green-600';
                return (
                  <div key={index} className="flex flex-col items-center group">
                    <div 
                      className={`w-3 ${color} ${hoverColor} rounded-t transition-colors relative`}
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {data.bounce_rate.toFixed(1)}%
                        <br />
                        {date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-sm text-gray-600 text-center">
              Last 30 days • Lower is better
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <div>
        <Card className="bg-white shadow-lg h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">🌐 Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Pie Chart Representation */}
            <div className="mb-6">
              <div className="w-48 h-48 rounded-full mx-auto relative overflow-hidden">
                {trafficSourcesData.map((source, index) => {
                  const previousPercentages = trafficSourcesData
                    .slice(0, index)
                    .reduce((sum, s) => sum + s.percentage, 0);
                  
                  const rotation = (previousPercentages / 100) * 360;
                  const sliceAngle = (source.percentage / 100) * 360;
                  
                  return (
                    <div
                      key={source.name}
                      className={`absolute inset-0 ${source.color} opacity-80`}
                      style={{
                        clipPath: `polygon(50% 50%, 50% 0%, ${
                          50 + 50 * Math.cos((rotation - 90) * Math.PI / 180)
                        }% ${
                          50 + 50 * Math.sin((rotation - 90) * Math.PI / 180)
                        }%, ${
                          50 + 50 * Math.cos((rotation + sliceAngle - 90) * Math.PI / 180)
                        }% ${
                          50 + 50 * Math.sin((rotation + sliceAngle - 90) * Math.PI / 180)
                        }%)`
                      }}
                    />
                  );
                })}
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-800">
                      {(totalTraffic / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {trafficSourcesData.map((source) => (
                <div key={source.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${source.color}`}></div>
                    <span className="text-sm text-gray-700 flex items-center">
                      <span className="mr-2">{source.icon}</span>
                      {source.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">
                      {source.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {source.value.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
