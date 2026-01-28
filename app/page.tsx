"use client";

import { useState, useEffect, useRef } from 'react';

// Common forex pairs
const FOREX_PAIRS = [
  'EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'AUD_USD',
  'USD_CAD', 'NZD_USD', 'EUR_GBP', 'EUR_JPY', 'GBP_JPY',
  'EUR_CHF', 'AUD_JPY', 'CAD_JPY', 'CHF_JPY', 'EUR_AUD',
  'EUR_CAD', 'GBP_CHF', 'AUD_CAD', 'AUD_NZD', 'EUR_NZD',
  'GBP_AUD', 'GBP_CAD', 'NZD_JPY', 'EUR_SEK', 'USD_SEK'
];

interface PriceData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Generate sample candlestick data
function generateSampleData(pair: string): PriceData[] {
  const data: PriceData[] = [];
  
  // Base price varies by pair
  let price = 1.0;
  if (pair.includes('JPY')) price = 150;
  if (pair === 'USD_CHF') price = 0.90;
  if (pair === 'GBP_USD') price = 1.27;
  
  const now = new Date();
  
  for (let i = 100; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(date.getHours() - i);
    
    const volatility = pair.includes('JPY') ? 0.5 : 0.002;
    const change = (Math.random() - 0.5) * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;
    
    data.push({
      time: date.toISOString().split('T')[0] + ' ' + date.getHours().toString().padStart(2, '0') + ':00',
      open: parseFloat(open.toFixed(pair.includes('JPY') ? 3 : 5)),
      high: parseFloat(high.toFixed(pair.includes('JPY') ? 3 : 5)),
      low: parseFloat(low.toFixed(pair.includes('JPY') ? 3 : 5)),
      close: parseFloat(close.toFixed(pair.includes('JPY') ? 3 : 5)),
    });
    
    price = close;
  }
  
  return data;
}

// Sample trades
const sampleTrades = [
  {
    id: 1, pair: 'EUR_USD', direction: 'BUY', entry: 1.0850, exit: 1.0920,
    pnl: 700, pnlPercent: 0.64, reason: 'Spring in accumulation',
    timestamp: '2026-01-28T10:30:00Z', phase: 'accumulation'
  },
  {
    id: 2, pair: 'GBP_USD', direction: 'SELL', entry: 1.2720, exit: 1.2680,
    pnl: 400, pnlPercent: 0.31, reason: 'Upthrust in distribution',
    timestamp: '2026-01-27T15:45:00Z', phase: 'distribution'
  },
  {
    id: 3, pair: 'USD_JPY', direction: 'BUY', entry: 156.80, exit: 155.20,
    pnl: -160, pnlPercent: -0.10, reason: 'False spring',
    timestamp: '2026-01-26T09:15:00Z', phase: 'markdown'
  },
];

const sampleSignal = {
  pair: 'EUR_USD', direction: 'BUY', confidence: 85,
  entry: 1.0875, stopLoss: 1.0830, takeProfit: 1.0975,
  phase: 'accumulation', event: 'spring',
  m5SwingLow: 1.0825, m5SwingHigh: 1.0890,
  reasons: [
    'D1: Accumulation phase (direction)',
    'H4: Confirms accumulation (context)',
    'M5: Spring at swing low',
  ],
};

function formatDate(dateStr: string) {
  try { return new Date(dateStr).toLocaleString(); }
  catch { return dateStr; }
}

// Simple canvas chart component
function CandleChart({ data, supportLine, resistanceLine, entryPrice, takeProfit }: {
  data: PriceData[];
  supportLine?: number;
  resistanceLine?: number;
  entryPrice?: number;
  takeProfit?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 400 * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = '400px';
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(0, 0, rect.width, 400);

    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const padding = 60;
    const chartHeight = 400 - padding * 2;
    const chartWidth = rect.width - padding * 2;

    function priceToY(price: number) {
      return padding + (maxPrice - price) / priceRange * chartHeight;
    }
    function timeToX(index: number) {
      return padding + (index / (data.length - 1)) * chartWidth;
    }

    // Grid
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
      const price = maxPrice - (i / 5) * priceRange;
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(5), padding - 8, y + 4);
    }

    // Support line (M5 swing low)
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
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SL: ${supportLine}`, rect.width - padding + 5, y + 4);
    }

    // Entry line
    if (entryPrice) {
      const y = priceToY(entryPrice);
      ctx.strokeStyle = '#ffd43b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
      ctx.fillStyle = '#ffd43b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Entry: ${entryPrice}`, rect.width - padding + 5, y + 4);
    }

    // Take profit
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
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`TP: ${takeProfit}`, rect.width - padding + 5, y + 4);
    }

    // Candlesticks
    const candleWidth = Math.max(3, (chartWidth / data.length) * 0.7);
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
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();
      
      ctx.fillRect(
        x - candleWidth / 2,
        Math.min(yOpen, yClose),
        candleWidth,
        Math.abs(yClose - yOpen) || 1
      );
    });

  }, [data, supportLine, resistanceLine, entryPrice, takeProfit]);

  return (
    <canvas 
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '400px' }}
    />
  );
}

export default function Dashboard() {
  const [selectedPair, setSelectedPair] = useState('EUR_USD');
  const [chartData, setChartData] = useState<PriceData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [pairs] = useState(FOREX_PAIRS);

  // Filter pairs based on search
  const filteredPairs = pairs.filter(pair =>
    pair.toLowerCase().replace('_', '').includes(searchTerm.toLowerCase().replace('_', ''))
  );

  // Load chart data when pair changes
  useEffect(() => {
    if (mounted) {
      setChartData(generateSampleData(selectedPair));
    }
  }, [selectedPair, mounted]);

  // Initial load
  useEffect(() => {
    setChartData(generateSampleData('EUR_USD'));
    setMounted(true);
  }, []);

  const trades = sampleTrades;
  const signal = sampleSignal;
  const accountBalance = 10250;
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(0) : '0';
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

  // Current signal for selected pair
  const currentSignal = {
    ...signal,
    pair: selectedPair,
    entry: chartData.length > 0 ? chartData[chartData.length - 1].close : signal.entry,
  };

  if (!mounted) {
    return (
      <div className="dashboard" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1>Wyckoff + VPA</h1>
          <a 
            href="/settings"
            style={{
              padding: '8px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            Settings
          </a>
        </div>
        <div className="header-stats">
          <div className="stat">
            <div className="stat-label">Account</div>
            <div className="stat-value">${accountBalance.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{winRate}%</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total P and L</div>
            <div className={`stat-value ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl}
            </div>
          </div>
        </div>
      </header>

      {/* Searchable Dropdown */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search pairs (e.g., EUR, JPY, USD)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingLeft: '40px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}>
              🔍
            </span>
          </div>
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            marginTop: '4px',
          }}>
            {filteredPairs.map(pair => (
              <button
                key={pair}
                onClick={() => {
                  setSelectedPair(pair);
                  setSearchTerm('');
                  setShowDropdown(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  background: pair === selectedPair ? 'var(--accent-blue)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {pair.replace('_', '/')}
              </button>
            ))}
            {filteredPairs.length === 0 && (
              <div style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>
                No pairs found
              </div>
            )}
          </div>
        )}

        {/* Selected pair display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <span style={{
            fontSize: '24px',
            fontWeight: '600',
          }}>
            {selectedPair.replace('_', '/')}
          </span>
          {chartData.length > 0 && (
            <span style={{
              fontSize: '18px',
              color: chartData[chartData.length - 1].close >= chartData[chartData.length - 1].open ? 'var(--accent-green)' : 'var(--accent-red)'
            }}>
              {chartData[chartData.length - 1].close.toFixed(5)}
            </span>
          )}
        </div>

        {/* Quick pair buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {FOREX_PAIRS.slice(0, 10).map(pair => (
            <button
              key={pair}
              onClick={() => setSelectedPair(pair)}
              className={`pair-tab ${selectedPair === pair ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
              }}
            >
              {pair.replace('_', '/')}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <span className="card-title">{selectedPair.replace('_', '/')} - M5 Timeframe</span>
          <span style={{ 
            padding: '4px 12px', 
            background: 'var(--accent-green)', 
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            M5 PRECISION
          </span>
        </div>
        <CandleChart 
          data={chartData}
          supportLine={currentSignal.m5SwingLow}
          resistanceLine={currentSignal.m5SwingHigh}
          entryPrice={currentSignal.entry}
          takeProfit={currentSignal.takeProfit}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          gap: '16px', 
          marginTop: '12px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <span><span style={{ color: 'var(--accent-green)' }}>┄┄┄</span> M5 Swing Low</span>
          <span><span style={{ color: '#ffd43b)' }}>━━</span> Entry</span>
          <span><span style={{ color: '#5c7cfa)' }}>··</span> Target</span>
        </div>
      </div>

      {/* Signal Card */}
      <div className="grid">
        <div className={`card signal-card ${currentSignal.direction.toLowerCase()}`}>
          <div className="card-header">
            <span className="card-title">Current Signal</span>
            <span className={`signal-direction ${currentSignal.direction.toLowerCase()}`}>
              {currentSignal.direction === 'BUY' ? 'uparrow' : 'downarrow'} {currentSignal.direction}
            </span>
          </div>
          <div className="card-value">{currentSignal.entry}</div>
          <div className="card-subtitle">Confidence: {currentSignal.confidence}%</div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stop Loss</div>
              <div style={{ fontWeight: '600' }}>{currentSignal.stopLoss}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Take Profit</div>
              <div style={{ fontWeight: '600' }}>{currentSignal.takeProfit}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phase</div>
              <span className={`phase-badge ${currentSignal.phase}`}>{currentSignal.phase}</span>
            </div>
          </div>
        </div>

        {/* Trade History */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">Recent Trades</span>
          </div>
          <div className="trade-list">
            {trades.map(trade => (
              <div key={trade.id} className="trade-item">
                <div className="trade-info">
                  <div className="trade-pair">
                    {trade.pair.replace('_', '/')} 
                    <span className={`signal-direction ${trade.direction.toLowerCase()}`} style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px' }}>
                      {trade.direction}
                    </span>
                  </div>
                  <div className="trade-time">{formatDate(trade.timestamp)} {trade.phase}</div>
                  <div className="trade-reason">{trade.reason}</div>
                </div>
                <div className="trade-result">
                  <div className={`trade-pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '24px', 
        color: 'var(--text-muted)',
        fontSize: '12px',
        borderTop: '1px solid var(--border-color)',
        marginTop: '32px'
      }}>
        <p>Wyckoff + VPA Trading System</p>
      </footer>
    </div>
  );
}
