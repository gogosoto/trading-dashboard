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
  supportLine?: number;      // M5 swing low (stop loss zone)
  resistanceLine?: number;   // M5 swing high
  currentPrice?: number;
  entryPrice?: number;       // Entry level
  takeProfit?: number;       // Target level
  signalDirection?: string;  // BUY or SELL
}

export default function PriceChart({ 
  data, 
  supportLine, 
  resistanceLine, 
  currentPrice,
  entryPrice,
  takeProfit,
  signalDirection
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

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
      width: chartContainerRef.current.clientWidth,
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

    // Transform data for lightweight-charts
    const candleData = data.map(d => ({
      time: d.time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(candleData);

    // M5 Swing Low (Stop Loss for BUY) - Green dashed
    if (supportLine) {
      chart.addLineSeries({
        color: '#00d4aa',
        lineWidth: 2,
        lineStyle: 2, // dashed
        priceLineVisible: false,
      }).setData([
        { time: data[0].time as any, value: supportLine },
        { time: data[data.length - 1].time as any, value: supportLine },
      ]);
    }

    // M5 Swing High (Stop Loss for SELL) - Red dashed
    if (resistanceLine) {
      chart.addLineSeries({
        color: '#ff4757',
        lineWidth: 2,
        lineStyle: 2, // dashed
        priceLineVisible: false,
      }).setData([
        { time: data[0].time as any, value: resistanceLine },
        { time: data[data.length - 1].time as any, value: resistanceLine },
      ]);
    }

    // Entry Price - Yellow solid
    if (entryPrice) {
      chart.addLineSeries({
        color: '#ffd43b',
        lineWidth: 2,
        lineStyle: 0, // solid
        priceLineVisible: false,
      }).setData([
        { time: data[0].time as any, value: entryPrice },
        { time: data[data.length - 1].time as any, value: entryPrice },
      ]);
    }

    // Take Profit - Blue dotted
    if (takeProfit) {
      chart.addLineSeries({
        color: '#5c7cfa',
        lineWidth: 2,
        lineStyle: 3, // dotted
        priceLineVisible: false,
      }).setData([
        { time: data[0].time as any, value: takeProfit },
        { time: data[data.length - 1].time as any, value: takeProfit },
      ]);
    }

    // Current Price
    if (currentPrice && currentPrice !== entryPrice) {
      chart.addLineSeries({
        color: '#ffffff',
        lineWidth: 1,
        lineStyle: 3, // dotted
        priceLineVisible: false,
      }).setData([
        { time: data[0].time as any, value: currentPrice },
        { time: data[data.length - 1].time as any, value: currentPrice },
      ]);
    }

    // Fit content
    chart.timeScale().fitContent();

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
      }} 
    />
  );
}
