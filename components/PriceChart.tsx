"use client";

import { useEffect, useRef, useState } from 'react';

interface PriceChartProps {
  data: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  supportLine?: number;
  resistanceLine?: number;
  currentPrice?: number;
  entryPrice?: number;
  takeProfit?: number;
  signalDirection?: string;
}

export default function PriceChart({ 
  data = [], 
  supportLine, 
  resistanceLine, 
  currentPrice,
  entryPrice,
  takeProfit
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Dynamic import to avoid SSR issues
    import('lightweight-charts').then((chartModule) => {
      const createChart = chartModule.createChart;
      const ColorType = chartModule.ColorType;
      
      if (!containerRef.current) return;
      
      setLoaded(true);
      
      try {
        const chart = createChart(containerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: '#1a1a24' },
            textColor: '#a0a0b0',
          },
          grid: {
            vertLines: { color: '#2a2a3a' },
            horzLines: { color: '#2a2a3a' },
          },
          width: containerRef.current.clientWidth || 800,
          height: 400,
        });

        const candleSeries = chart.addCandlestickSeries({
          upColor: '#00d4aa',
          downColor: '#ff4757',
          borderUpColor: '#00d4aa',
          borderDownColor: '#ff4757',
          wickUpColor: '#00d4aa',
          wickDownColor: '#ff4757',
        });

        if (data.length > 0) {
          const candleData = data.map(d => ({
            time: d.time.split(' ')[0] as any,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          }));
          candleSeries.setData(candleData);
        }

        if (supportLine) {
          const lineSeries = chart.addLineSeries({
            color: '#00d4aa',
            lineWidth: 2,
            lineStyle: 2,
          });
          if (data.length > 0) {
            lineSeries.setData([
              { time: data[0].time.split(' ')[0] as any, value: supportLine },
              { time: data[data.length - 1].time.split(' ')[0] as any, value: supportLine },
            ]);
          }
        }

        if (entryPrice) {
          const lineSeries = chart.addLineSeries({
            color: '#ffd43b',
            lineWidth: 2,
            lineStyle: 0,
          });
          if (data.length > 0) {
            lineSeries.setData([
              { time: data[0].time.split(' ')[0] as any, value: entryPrice },
              { time: data[data.length - 1].time.split(' ')[0] as any, value: entryPrice },
            ]);
          }
        }

        if (takeProfit) {
          const lineSeries = chart.addLineSeries({
            color: '#5c7cfa',
            lineWidth: 2,
            lineStyle: 3,
          });
          if (data.length > 0) {
            lineSeries.setData([
              { time: data[0].time.split(' ')[0] as any, value: takeProfit },
              { time: data[data.length - 1].time.split(' ')[0] as any, value: takeProfit },
            ]);
          }
        }

        chart.timeScale().fitContent();

        const handleResize = () => {
          if (containerRef.current) {
            chart.applyOptions({ width: containerRef.current.clientWidth });
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
        };
      } catch (err: any) {
        setError(err.message);
      }
    }).catch((err: any) => {
      setError('Failed to load chart library');
    });

  }, [data, supportLine, resistanceLine, entryPrice, takeProfit]);

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '400px',
        background: '#1a1a24',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ff4757',
        borderRadius: '12px',
      }}>
        Chart error: {error}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#1a1a24',
      }} 
    />
  );
}
