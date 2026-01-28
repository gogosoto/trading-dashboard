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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Could not get canvas context');
      return;
    }

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 400 * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = '400px';
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(0, 0, rect.width, 400);

    // Calculate scales
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const padding = 40;
    const chartHeight = 400 - padding * 2;
    const chartWidth = rect.width - padding * 2;

    function priceToY(price: number) {
      return padding + (maxPrice - price) / priceRange * chartHeight;
    }

    function timeToX(index: number) {
      return padding + (index / (data.length - 1)) * chartWidth;
    }

    // Draw grid
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
      
      // Price label
      const price = maxPrice - (i / 5) * priceRange;
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(5), padding - 8, y + 4);
    }

    // Draw support line
    if (supportLine) {
      const y = priceToY(supportLine);
      ctx.strokeStyle = '#00d4aa';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#00d4aa';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SL: ${supportLine}`, rect.width - padding + 5, y + 4);
    }

    // Draw entry line
    if (entryPrice) {
      const y = priceToY(entryPrice);
      ctx.strokeStyle = '#ffd43b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
      
      ctx.fillStyle = '#ffd43b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Entry: ${entryPrice}`, rect.width - padding + 5, y + 4);
    }

    // Draw take profit line
    if (takeProfit) {
      const y = priceToY(takeProfit);
      ctx.strokeStyle = '#5c7cfa';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#5c7cfa';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`TP: ${takeProfit}`, rect.width - padding + 5, y + 4);
    }

    // Draw candlesticks
    const candleWidth = Math.max(2, (chartWidth / data.length) * 0.7);
    const gap = (chartWidth / data.length) * 0.3;

    data.forEach((candle, i) => {
      const x = timeToX(i);
      const yOpen = priceToY(candle.open);
      const yClose = priceToY(candle.close);
      const yHigh = priceToY(candle.high);
      const yLow = priceToY(candle.low);
      
      const isUp = candle.close >= candle.open;
      const color = isUp ? '#00d4aa' : '#ff4757';
      
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      
      // Wick
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();
      
      // Body
      ctx.fillRect(
        x - candleWidth / 2,
        Math.min(yOpen, yClose),
        candleWidth,
        Math.abs(yClose - yOpen) || 1
      );
    });

    // Current price dot
    if (currentPrice && data.length > 0) {
      const lastCandle = data[data.length - 1];
      const x = timeToX(data.length - 1);
      const y = priceToY(currentPrice);
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.stroke();
    }

  }, [data, supportLine, resistanceLine, currentPrice, entryPrice, takeProfit]);

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
    >
      <canvas 
        ref={canvasRef}
        style={{ display: 'block' }}
      />
    </div>
  );
}
