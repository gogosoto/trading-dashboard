"use client";

import { useState, useEffect } from 'react';
import PriceChart from '../../components/PriceChart';

// Generate sample candlestick data
function generateSampleData() {
  const data = [];
  let price = 1.0850;
  const now = new Date();
  
  for (let i = 100; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(date.getHours() - i);
    
    const volatility = 0.002;
    const change = (Math.random() - 0.5) * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    data.push({
      time: date.toISOString().split('T')[0] + ' ' + date.getHours().toString().padStart(2, '0') + ':00',
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(low.toFixed(5)),
      close: parseFloat(close.toFixed(5)),
    });
    
    price = close;
  }
  
  return data;
}

// Sample data - use string dates instead of Date objects
const sampleTrades = [
  {
    id: 1,
    pair: 'EUR_USD',
    direction: 'BUY',
    entry: 1.0850,
    exit: 1.0920,
    pnl: 700,
    pnlPercent: 0.64,
    reason: 'Spring in accumulation, volume confirms',
    timestamp: '2026-01-28T10:30:00Z',
    phase: 'accumulation'
  },
  {
    id: 2,
    pair: 'GBP_USD',
    direction: 'SELL',
    entry: 1.2720,
    exit: 1.2680,
    pnl: 400,
    pnlPercent: 0.31,
    reason: 'Upthrust in distribution',
    timestamp: '2026-01-27T15:45:00Z',
    phase: 'distribution'
  },
  {
    id: 3,
    pair: 'USD_JPY',
    direction: 'BUY',
    entry: 156.80,
    exit: 155.20,
    pnl: -160,
    pnlPercent: -0.10,
    reason: 'False spring, stopped out',
    timestamp: '2026-01-26T09:15:00Z',
    phase: 'markdown'
  },
];

const sampleSignal = {
  pair: 'EUR_USD',
  direction: 'BUY',
  confidence: 85,
  entry: 1.0875,
  stopLoss: 1.0830,
  takeProfit: 1.0975,
  phase: 'accumulation',
  event: 'spring',
  reasons: [
    'Wyckoff: Accumulation phase detected',
    'Spring at support zone 1.0830',
    'Volume below average (not climax)',
    'Test shows buying pressure',
    'Up/Down volume ratio: 1.8',
  ],
  vpaMetrics: {
    volumeRatio: 0.9,
    spreadPct: 12,
    upDownRatio: 1.8,
  },
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
}

export default function Dashboard() {
  const [selectedPair, setSelectedPair] = useState('EUR_USD');
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setChartData(generateSampleData());
  }, []);

  const trades = sampleTrades;
  const signal = sampleSignal;
  const accountBalance = 10250;
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(0) : '0';
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

  if (!mounted) {
    return (
      <div className="dashboard" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1>Wyckoff + VPA Trading System</h1>
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

      {/* Pair Selector */}
      <div className="pair-tabs">
        {['EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'AUD_USD'].map(pair => (
          <button
            key={pair}
            className={`pair-tab ${selectedPair === pair ? 'active' : ''}`}
            onClick={() => setSelectedPair(pair)}
          >
            {pair.replace('_', '/')}
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <span className="card-title">{selectedPair.replace('_', '/')} Price Chart (H1)</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ 
              padding: '4px 12px', 
              background: 'var(--accent-green)', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              LIVE
            </span>
          </div>
        </div>
        <PriceChart 
          data={chartData}
          supportLine={signal.stopLoss}
          resistanceLine={signal.takeProfit}
          currentPrice={signal.entry}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px', 
          marginTop: '12px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <span><span style={{ color: 'var(--accent-green)' }}>━━━</span> Support ({signal.stopLoss})</span>
          <span><span style={{ color: 'var(--accent-red)' }}>━━━</span> Resistance ({signal.takeProfit})</span>
          <span><span style={{ color: '#ffd43b' }}>━━━</span> Current ({signal.entry})</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid">
        {/* Current Signal */}
        <div className={`card signal-card ${signal.direction.toLowerCase()}`}>
          <div className="card-header">
            <span className="card-title">Current Signal</span>
            <span className={`signal-direction ${signal.direction.toLowerCase()}`}>
              {signal.direction === 'BUY' ? 'uparrow' : 'downarrow'} {signal.direction}
            </span>
          </div>
          <div className="card-value">{signal.entry}</div>
          <div className="card-subtitle">
            Confidence: {signal.confidence}%
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stop Loss</div>
              <div style={{ fontWeight: '600' }}>{signal.stopLoss}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Take Profit</div>
              <div style={{ fontWeight: '600' }}>{signal.takeProfit}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phase</div>
              <span className={`phase-badge ${signal.phase}`}>{signal.phase}</span>
            </div>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Market Analysis</span>
          </div>
          <div className="card-value">{signal.entry}</div>
          <div className="card-subtitle">
            EUR/USD H1 Timeframe
          </div>
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Support Zone</div>
              <div style={{ fontWeight: '600', color: 'var(--accent-green)' }}>
                {signal.stopLoss}
              </div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Resistance Zone</div>
              <div style={{ fontWeight: '600', color: 'var(--accent-red)' }}>
                {signal.takeProfit}
              </div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Volume Ratio</div>
              <div style={{ fontWeight: '600' }}>
                {signal.vpaMetrics.volumeRatio}x
              </div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Spread Percent</div>
              <div style={{ fontWeight: '600' }}>
                {signal.vpaMetrics.spreadPct}%
              </div>
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Signal Reasoning</span>
          </div>
          <div className="reasoning-list">
            {signal.reasons.map((reason: string, i: number) => (
              <div key={i} className="reasoning-item">
                <div className="reasoning-icon vpa">V</div>
                <div className="reasoning-text">{reason}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade History */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">Recent Trades</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {totalTrades} trades
            </span>
          </div>
          <div className="trade-list">
            {trades.map((trade: typeof trades[0]) => (
              <div key={trade.id} className="trade-item">
                <div className="trade-info">
                  <div className="trade-pair">
                    {trade.pair.replace('_', '/')} 
                    <span className={`signal-direction ${trade.direction.toLowerCase()}`} style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px' }}>
                      {trade.direction}
                    </span>
                  </div>
                  <div className="trade-time">
                    {formatDate(trade.timestamp)} {trade.phase}
                  </div>
                  <div className="trade-reason">{trade.reason}</div>
                </div>
                <div className="trade-result">
                  <div className={`trade-pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent}%
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
        <p>Wyckoff + VPA Trading System Pure Price Action + Volume</p>
        <p style={{ marginTop: '8px' }}>
          Always use paper trading first. Past performance does not guarantee future results.
        </p>
      </footer>
    </div>
  );
}
