"use client";

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';

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
  data, 
  supportLine, 
  resistanceLine, 
  currentPrice,
  entryPrice,
  takeProfit
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) {
      console.log('Chart: No data or container');
      return;
    }

    console.log('Chart: Rendering with', data.length, 'candles');

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#1a1a24' },
          textColor: '#a0a0b0',
        },
        grid: {
          vertLines: { color: '#2a2a3a' },
          horzLines: { color: '#2a2a3a' },
        },
        width: chartContainerRef.current.clientWidth || 800,
        height: 400,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // Add candlestick series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00d4aa',
        downColor: '#ff4757',
        borderUpColor: '#00d4aa',
        borderDownColor: '#ff4757',
        wickUpColor: '#00d4aa',
        wickDownColor: '#ff4757',
      });

      // Transform data
      const candleData = data.map(d => ({
        time: d.time.split(' ')[0] as any, // Use date only
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      console.log('Chart: Setting', candleData.length, 'candles');
      candlestickSeries.setData(candleData);

      // Add support line
      if (supportLine) {
        chart.addLineSeries({
          color: '#00d4aa',
          lineWidth: 2,
          lineStyle: 2,
          priceLineVisible: false,
        }).setData([
          { time: candleData[0].time, value: supportLine },
          { time: candleData[candleData.length - 1].time, value: supportLine },
        ]);
      }

      // Add resistance line
      if (resistanceLine) {
        chart.addLineSeries({
          color: '#ff4757',
          lineWidth: 2,
          lineStyle: 2,
          priceLineVisible: false,
        }).setData([
          { time: candleData[0].time, value: resistanceLine },
          { time: candleData[candleData.length - 1].time, value: resistanceLine },
        ]);
      }

      // Add entry line
      if (entryPrice) {
        chart.addLineSeries({
          color: '#ffd43b',
          lineWidth: 2,
          lineStyle: 0,
          priceLineVisible: false,
        }).setData([
          { time: candleData[0].time, value: entryPrice },
          { time: candleData[candleData.length - 1].time, value: entryPrice },
        ]);
      }

      // Add take profit line
      if (takeProfit) {
        chart.addLineSeries({
          color: '#5c7cfa',
          lineWidth: 2,
          lineStyle: 3,
          priceLineVisible: false,
        }).setData([
          { time: candleData[0].time, value: takeProfit },
          { time: candleData[candleData.length - 1].time, value: takeProfit },
        ]);
      }

      // Fit content
      chart.timeScale().fitContent();
      console.log('Chart: Rendered successfully');

    } catch (error) {
      console.error('Chart error:', error);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, supportLine, resistanceLine, currentPrice, entryPrice, takeProfit]);

  return (
    <div 
      ref={chartContainerRef} 
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
