"use client";

import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPuter } from '@/lib/puterClient';

interface TokenUsage {
  date: string;
  modelId: string;
  tokens: number;
  cost?: number;
  duration: number; // milliseconds
}

export function AnalyticsDashboard() {
  const [usageData, setUsageData] = useState<TokenUsage[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    const puter = getPuter();
    if (!puter) return;
    try {
      const data = await puter.kv.get('analytics:token_usage') || [];
      setUsageData(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  }

  // Process data for charts
  const processData = () => {
    const now = Date.now();
    const rangeMs = timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 : Infinity;
    const filtered = usageData.filter((d) => now - new Date(d.date).getTime() < rangeMs);

    // Group by date
    const byDate = filtered.reduce((acc, item) => {
      const date = new Date(item.date).toLocaleDateString();
      if (!acc[date]) acc[date] = { tokens: 0, requests: 0, duration: 0 };
      acc[date].tokens += item.tokens;
      acc[date].requests += 1;
      acc[date].duration += item.duration;
      return acc;
    }, {} as Record<string, { tokens: number; requests: number; duration: number }>);

    // Group by model
    const byModel = filtered.reduce((acc, item) => {
      if (!acc[item.modelId]) acc[item.modelId] = { tokens: 0, requests: 0, duration: 0 };
      acc[item.modelId].tokens += item.tokens;
      acc[item.modelId].requests += 1;
      acc[item.modelId].duration += item.duration;
      return acc;
    }, {} as Record<string, { tokens: number; requests: 0; duration: number }>);

    return { byDate, byModel, total: filtered.length };
  };

  const { byDate, byModel, total } = processData();

  const tokenChartOption = {
    title: { text: 'Token Usage Over Time', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
    tooltip: { trigger: 'axis', backgroundColor: '#1f2937', borderColor: '#374151' },
    xAxis: {
      type: 'category',
      data: Object.keys(byDate),
      axisLabel: { color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#374151' } },
      splitLine: { lineStyle: { color: '#374151' } },
    },
    series: [{
      data: Object.values(byDate).map((d) => d.tokens),
      type: 'line',
      smooth: true,
      itemStyle: { color: '#3b82f6' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.3)' }, { offset: 1, color: 'rgba(59, 130, 246, 0)' }] } },
    }],
    backgroundColor: 'transparent',
  };

  const modelChartOption = {
    title: { text: 'Usage by Model', left: 'center', textStyle: { color: '#e5e7eb', fontSize: 14 } },
    tooltip: { trigger: 'item', backgroundColor: '#1f2937', borderColor: '#374151' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: Object.entries(byModel).map(([model, data]) => ({
        value: data.tokens,
        name: model.split('/').pop() || model,
      })),
      itemStyle: {
        borderRadius: 8,
        borderColor: '#1f2937',
        borderWidth: 2,
      },
      label: { color: '#e5e7eb' },
    }],
    backgroundColor: 'transparent',
  };

  const totalTokens = Object.values(byDate).reduce((sum, d) => sum + d.tokens, 0);
  const totalRequests = total;
  const avgDuration = Object.values(byDate).reduce((sum, d) => sum + d.duration, 0) / (Object.keys(byDate).length || 1);

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics & Usage</h2>
          <p className="text-sm text-muted-foreground mt-1">Track token usage, model performance, and costs</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tokens</CardDescription>
            <CardTitle className="text-3xl font-bold">{totalTokens.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl font-bold">{totalRequests}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl font-bold">{(avgDuration / 1000).toFixed(1)}s</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Token Usage Over Time</CardTitle>
            <CardDescription>Daily token consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={tokenChartOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage by Model</CardTitle>
            <CardDescription>Token distribution across models</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={modelChartOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>Detailed breakdown by model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(byModel)
              .sort(([, a], [, b]) => b.tokens - a.tokens)
              .map(([model, data]) => (
                <div key={model} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium text-foreground">{model.split('/').pop() || model}</div>
                    <div className="text-sm text-muted-foreground">{data.requests} requests</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{data.tokens.toLocaleString()} tokens</div>
                    <div className="text-sm text-muted-foreground">{(data.duration / data.requests / 1000).toFixed(1)}s avg</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

