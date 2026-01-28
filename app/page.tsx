"use client";

import { useState, useEffect, useRef } from 'react';

const API_URL = 'https://trading-api.wnrpv6pdgc.workers.dev';

const FOREX_PAIRS = [
  'EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'AUD_USD',
  'USD_CAD', 'NZD_USD', 'EUR_GBP', 'EUR_JPY', 'GBP_JPY',
  'EUR_CHF', 'AUD_JPY', 'CAD_JPY', 'CHF_JPY', 'EUR_AUD',
  'EUR_CAD', 'GBP_CHF', 'AUD_CAD', 'AUD_NZD', 'EUR_NZD',
  'GBP_AUD', 'GBP_CAD', 'NZD_JPY', 'EUR_SEK', 'USD_SEK'
];

const TIMEFRAMES = [
  { value: 'M5', label: 'M5', minutes: 5 },
  { value: 'M15', label: 'M15', minutes: 15 },
  { value: 'M30', label: 'M30', minutes: 30 },
  { value: 'H1', label: 'H1', minutes: 60 },
  { value: 'H4', label: 'H4', minutes: 240 },
  { value: 'D1', label: 'D1', minutes: 1440 },
];

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618];

interface Candle { time: string; open: number; high: number; low: number; close: number; volume?: number; }
interface TradeSignal { direction: string; entry: number; stopLoss: number; takeProfit: number; confidence: number; phase: string; event: string; reasons: string[]; riskReward: number; qpAnalysis?: any; }
interface Position { id: string; pair: string; direction: string; entry: number; sl: number; tp: number; current: number; pnl: number; pnlPercent: number; opened: string; timeframe: string; }
interface Trade { id: string; pair: string; direction: string; entry: number; exit: number; pnl: number; pnlPercent: number; reason: string; opened: string; closed: string; outcome: 'WIN' | 'LOSS' | 'BREAKEVEN'; timeframe: string; }

async function fetchCandles(pair: string, timeframe: string, count: number = 100): Promise<Candle[]> {
  try {
    const response = await fetch(\`\${API_URL}/api/candles/\${pair}?timeframe=\${timeframe}&count=\${count}\`);
    const data = await response.json();
    if (data.data) return data.data;
  } catch { }
  return generateSampleData(pair, timeframe, count);
}

function generateSampleData(pair: string, timeframe: string, count: number): Candle[] {
  const data: Candle[] = [];
  let price = getBasePrice(pair);
  const now = new Date();
  const tf = TIMEFRAMES.find(t => t.value === timeframe) || TIMEFRAMES[0];
  for (let i = count; i >= 0; i--) {
    const time = new Date(now);
    time.setMinutes(time.getMinutes() - i * tf.minutes);
    const volatility = pair.includes('JPY') ? (tf.minutes >= 60 ? 1.5 : 0.3) : (tf.minutes >= 60 ? 0.01 : 0.0015);
    const change = (Math.random() - 0.5) * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.2;
    const low = Math.min(open, close) - Math.random() * volatility * 0.2;
    data.push({ time: time.toISOString(), open: parseFloat(open.toFixed(getDecimals(pair))), high: parseFloat(high.toFixed(getDecimals(pair))), low: parseFloat(low.toFixed(getDecimals(pair))), close: parseFloat(close.toFixed(getDecimals(pair))), volume: Math.floor(Math.random() * 1000) + 100 });
    price = close;
  }
  return data;
}

function getBasePrice(pair: string): number {
  const prices: Record<string, number> = { 'EUR_USD': 1.0850, 'GBP_USD': 1.2700, 'USD_JPY': 156.50, 'USD_CHF': 0.8850, 'AUD_USD': 0.6550, 'USD_CAD': 1.3650, 'NZD_USD': 0.6050, 'EUR_GBP': 0.8550, 'EUR_JPY': 169.80, 'GBP_JPY': 198.80, 'EUR_CHF': 0.9650, 'AUD_JPY': 102.50, 'CAD_JPY': 114.60, 'CHF_JPY': 176.80, 'EUR_AUD': 1.6560, 'EUR_CAD': 1.4810, 'GBP_CHF': 1.1240, 'AUD_CAD': 0.8940, 'AUD_NZD': 1.0820, 'EUR_NZD': 1.7920, 'GBP_AUD': 1.9380, 'GBP_CAD': 1.7330, 'NZD_JPY': 94.70, 'EUR_SEK': 11.45, 'USD_SEK': 10.55 };
  return prices[pair] || 1.0;
}

function getDecimals(pair: string): number { return pair.includes('JPY') ? 3 : 5; }

function analyzeQuarterPoints(candles: Candle[]) {
  if (candles.length < 50) return { quarterlyPoints: [], fibLevels: FIB_LEVELS, alignedPoints: [], strength: 'WEAK' };
  const recent = candles.slice(-100);
  const highs = recent.map(c => c.high);
  const lows = recent.map(c => c.low);
  const rangeHigh = Math.max(...highs);
  const rangeLow = Math.min(...lows);
  const range = rangeHigh - rangeLow;
  const quarterlyPoints = [rangeHigh, rangeLow];
  const swingHighs: number[] = [];
  const swingLows: number[] = [];
  for (let i = 5; i < recent.length - 5; i++) {
    const isSwingHigh = recent[i].high >= Math.max(...recent.slice(i - 5, i + 5).map(c => c.high));
    const isSwingLow = recent[i].low <= Math.min(...recent.slice(i - 5, i + 5).map(c => c.low));
    if (isSwingHigh) swingHighs.push(recent[i].high);
    if (isSwingLow) swingLows.push(recent[i].low);
  }
  swingHighs.slice(0, 3).forEach(p => quarterlyPoints.push(p));
  swingLows.slice(0, 3).forEach(p => quarterlyPoints.push(p));
  const fibLevels = FIB_LEVELS.map(fib => rangeLow + range * fib);
  const tolerance = range * 0.02;
  const alignedPoints: number[] = [];
  quarterlyPoints.forEach(qp => {
    fibLevels.forEach(fib => {
      if (Math.abs(qp - fib) < tolerance) alignedPoints.push(qp);
    });
  });
  const strength = alignedPoints.length >= 3 ? 'STRONG' : alignedPoints.length >= 2 ? 'MODERATE' : 'WEAK';
  return { quarterlyPoints: [...new Set(quarterlyPoints)], fibLevels, alignedPoints: [...new Set(alignedPoints)], strength };
}

function calculateSignal(pair: string, candles: Candle[], timeframe: string): TradeSignal | null {
  if (candles.length < 50) return null;
  const recent = candles.slice(-50);
  const current = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const qpAnalysis = analyzeQuarterPoints(candles);
  const volumes = recent.map(c => c.volume || 0);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const currentVolume = current.volume || 0;
  const volumeRatio = currentVolume / avgVolume;
  const ranges = recent.map(c => c.high - c.low);
  const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
  const support = Math.min(...recent.map(c => c.low));
  const resistance = Math.max(...recent.map(c => c.high));
  const compression = 1 - (avgRange * 50 / (resistance - support + 0.0001));
  const upVolume = recent.filter(c => c.close > c.open).reduce((a, b) => a + (b.volume || 0), 0);
  const downVolume = recent.filter(c => c.close < c.open).reduce((a, b) => a + (b.volume || 0), 0);
  const volumeTrend = (upVolume - downVolume) / (upVolume + downVolume + 1);
  let phase = 'RANGE';
  let phaseConfidence = 0.5;
  const pricePosition = (current.close - support) / (resistance - support + 0.0001);
  if (compression > 0.6 && volumeTrend < -0.2 && pricePosition < 0.4) { phase = 'ACCUMULATION'; phaseConfidence = 0.85; }
  else if (compression > 0.6 && volumeTrend > 0.2 && pricePosition > 0.6) { phase = 'DISTRIBUTION'; phaseConfidence = 0.85; }
  else if (volumeTrend > 0.3 && pricePosition > 0.5) { phase = 'MARKUP'; phaseConfidence = 0.75; }
  else if (volumeTrend < -0.3 && pricePosition < 0.5) { phase = 'MARKDOWN'; phaseConfidence = 0.75; }
  let event = 'NONE';
  let eventConfidence = 0;
  const swingLow = Math.min(...recent.slice(-10).map(c => c.low));
  const swingHigh = Math.max(...recent.slice(-10).map(c => c.high));
  const qpTolerance = (resistance - support) * 0.02;
  const isNearQP = (price: number) => qpAnalysis.alignedPoints.some(qp => Math.abs(price - qp) < qpTolerance);
  if (current.low < support && current.close > support * 0.999) { event = 'SPRING'; eventConfidence = Math.max(0.5, 1 - volumeRatio / 3); if (isNearQP(support)) eventConfidence = Math.min(1, eventConfidence + 0.2); }
  else if (current.high > resistance && current.close < resistance * 1.001) { event = 'UPTHRUST'; eventConfidence = Math.max(0.5, 1 - volumeRatio / 3); if (isNearQP(resistance)) eventConfidence = Math.min(1, eventConfidence + 0.2); }
  else if (current.low <= swingLow * 1.002 && current.close > current.open) { event = 'TEST_SUPPORT'; eventConfidence = 0.7; if (isNearQP(swingLow)) eventConfidence = Math.min(1, eventConfidence + 0.15); }
  else if (current.high >= swingHigh * 0.998 && current.close < current.open) { event = 'TEST_RESISTANCE'; eventConfidence = 0.7; if (isNearQP(swingHigh)) eventConfidence = Math.min(1, eventConfidence + 0.15); }
  let direction = 'HOLD';
  let reasons: string[] = [];
  let confidence = 0;
  let entry = current.close;
  let sl = 0;
  let tp = 0;
  const riskReward = 2.0;
  const trs = recent.slice(-14).map(c => Math.max(c.high - c.low, Math.abs(c.high - prev.close), Math.abs(c.low - prev.close)));
  const atr = trs.reduce((a, b) => a + b, 0) / trs.length;
  const qpBonus = qpAnalysis.alignedPoints.length >= 2 ? 0.15 : 0;
  if (phase === 'ACCUMULATION' && event === 'SPRING' && volumeRatio < 1.5) {
    direction = 'BUY';
    const stopDistance = atr * 1.5;
    sl = support;
    tp = current.close + stopDistance * riskReward;
    reasons = [\`\${timeframe}: Accumulation (\${(phaseConfidence * 100).toFixed(0)}%)\`, \`\${timeframe}: Spring at \${support.toFixed(5)}\`, \`Volume: \${volumeRatio.toFixed(1)}x\`, \`QPT: \${qpAnalysis.strength} (\${qpAnalysis.alignedPoints.length} aligned)\`, \`R:R 1:\${riskReward} (1% risk)\`, \`SL: \${sl.toFixed(5)} | TP: \${tp.toFixed(5)}\`];
    confidence = Math.min((phaseConfidence * 0.25 + eventConfidence * 0.35 + (2 - volumeRatio) * 0.25 + qpBonus), 1);
  } else if (phase === 'DISTRIBUTION' && event === 'UPTHRUST' && volumeRatio < 1.5) {
    direction = 'SELL';
    const stopDistance = atr * 1.5;
    sl = resistance;
    tp = current.close - stopDistance * riskReward;
    reasons = [\`\${timeframe}: Distribution (\${(phaseConfidence * 100).toFixed(0)}%)\`, \`\${timeframe}: Upthrust at \${resistance.toFixed(5)}\`, \`Volume: \${volumeRatio.toFixed(1)}x\`, \`QPT: \${qpAnalysis.strength} (\${qpAnalysis.alignedPoints.length} aligned)\`, \`R:R 1:\${riskReward} (1% risk)\`, \`SL: \${sl.toFixed(5)} | TP: \${tp.toFixed(5)}\`];
    confidence = Math.min((phaseConfidence * 0.25 + eventConfidence * 0.35 + (2 - volumeRatio) * 0.25 + qpBonus), 1);
  } else {
    reasons = [\`Phase: \${phase} | Event: \${event}\`, \`Volume: \${volumeRatio.toFixed(1)}x\`, \`QPT: \${qpAnalysis.strength} (\${qpAnalysis.alignedPoints.length} aligned)\`, 'Waiting for alignment...'];
  }
  return { direction, entry, stopLoss: sl, takeProfit: tp, confidence, phase, event, reasons, riskReward, qpAnalysis };
}

function Chart({ data, signal }: { data: Candle[]; signal: TradeSignal | null }) {
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
    canvas.style.width = \`\${rect.width}px\`;
    canvas.style.height = '400px';
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(0, 0, rect.width, 400);
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const padding = 70;
    const chartHeight = 400 - padding * 2;
    const chartWidth = rect.width - padding * 2;
    function priceToY(price: number) { return padding + (maxPrice - price) / priceRange * chartHeight; }
    function timeToX(index: number) { return padding + (index / (data.length - 1)) * chartWidth; }
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(rect.width - padding, y); ctx.stroke();
      const price = maxPrice - (i / 5) * priceRange;
      ctx.fillStyle = '#a0a0b0'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(5), padding - 8, y + 4);
    }
    if (signal?.qpAnalysis) {
      signal.qpAnalysis.fibLevels.forEach((fib: number, i: number) => {
        if (fib >= minPrice && fib <= maxPrice) {
          const alpha = i === 3 ? 0.3 : 0.15;
          ctx.strokeStyle = \`rgba(92, 124,250,\${alpha})\`;
          ctx.lineWidth = i === 3 ? 1.5 : 1;
          ctx.setLineDash([2, 4]);
          ctx.beginPath(); ctx.moveTo(padding, priceToY(fib)); ctx.lineTo(rect.width - padding, priceToY(fib)); ctx.stroke();
        }
      });
      ctx.setLineDash([]);
    }
    if (signal?.qpAnalysis?.alignedPoints) {
      signal.qpAnalysis.alignedPoints.forEach((qp: number) => {
        if (qp >= minPrice && qp <= maxPrice) {
          ctx.strokeStyle = '#ffd43b';
          ctx.lineWidth = 2;
          ctx.setLineDash([2, 2]);
          ctx.beginPath(); ctx.moveTo(padding, priceToY(qp)); ctx.lineTo(rect.width - padding, priceToY(qp)); ctx.stroke();
        }
      });
      ctx.setLineDash([]);
    }
    const support = Math.min(...data.slice(-50).map(c => c.low));
    const resistance = Math.max(...data.slice(-50).map(c => c.high));
    ctx.strokeStyle = '#00d4aa'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(padding, priceToY(support)); ctx.lineTo(rect.width - padding, priceToY(support)); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = '#00d4aa'; ctx.textAlign = 'left';
    ctx.fillText(\`Support: \${support.toFixed(5)}\`, rect.width - padding + 5, priceToY(support) + 4);
    ctx.strokeStyle = '#ff4757'; ctx.beginPath(); ctx.moveTo(padding, priceToY(resistance)); ctx.lineTo(rect.width - padding, priceToY(resistance)); ctx.stroke();
    ctx.fillStyle = '#ff4757'; ctx.fillText(\`Resistance: \${resistance.toFixed(5)}\`, rect.width - padding + 5, priceToY(resistance) + 4);
    if (signal && signal.direction !== 'HOLD') {
      ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(padding, priceToY(signal.entry)); ctx.lineTo(rect.width - padding, priceToY(signal.entry)); ctx.stroke();
      ctx.fillStyle = '#ffd43b'; ctx.fillText(\`Entry: \${signal.entry.toFixed(5)}\`, rect.width - padding + 5, priceToY(signal.entry) + 4);
      ctx.strokeStyle = '#ff4757'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(padding, priceToY(signal.stopLoss)); ctx.lineTo(rect.width - padding, priceToY(signal.stopLoss)); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#ff4757'; ctx.fillText(\`SL: \${signal.stopLoss.toFixed(5)}\`, rect.width - padding + 5, priceToY(signal.stopLoss) + 4);
      ctx.strokeStyle = '#00d4aa'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(padding, priceToY(signal.takeProfit)); ctx.lineTo(rect.width - padding, priceToY(signal.takeProfit)); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#00d4aa'; ctx.fillText(\`TP: \${signal.takeProfit.toFixed(5)}\`, rect.width - padding + 5, priceToY(signal.takeProfit) + 4);
    }
    const candleWidth = Math.max(3, (chartWidth / data.length) * 0.7);
    data.forEach((candle, i) => {
      const x = timeToX(i);
      const yOpen = priceToY(candle.open);
      const yClose = priceToY(candle.close);
      const yHigh = priceToY(candle.high);
      const yLow = priceToY(candle.low);
      const isUp = candle.close >= candle.open;
      const color = isUp ? '#00d4aa' : '#ff4757';
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, yHigh); ctx.lineTo(x, yLow); ctx.stroke();
      ctx.fillRect(x - candleWidth / 2, Math.min(yOpen, yClose), candleWidth, Math.abs(yClose - yOpen) || 1);
    });
  }, [data, signal]);
  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '400px' }} />;
}

export default function Dashboard() {
  const [selectedPair, setSelectedPair] = useState('EUR_USD');
  const [timeframe, setTimeframe] = useState('M5');
  const [chartData, setChartData] = useState<Candle[]>([]);
  const [signal, setSignal] = useState<TradeSignal | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPnl, setTotalPnl] = useState(0);
  const filteredPairs = FOREX_PAIRS.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
  const loadData = async (pair: string, tf: string) => { setLoading(true); const data = await fetchCandles(pair, tf, tf === 'D1' ? 100 : 200); setChartData(data); setSignal(calculateSignal(pair, data, tf)); setLoading(false); };
  useEffect(() => { loadData(selectedPair, timeframe); }, [selectedPair, timeframe]);
  useEffect(() => {
    if (positions.length > 0 && chartData.length > 0) {
      const updated = positions.map(p => {
        const current = chartData[chartData.length - 1].close;
        const pnl = p.direction === 'BUY' ? (current - p.entry) / p.entry * 10000 * 1000 : (p.entry - current) / p.entry * 10000 * 1000;
        return { ...p, current, pnl, pnlPercent: pnl / (p.entry * 1000) * 100 };
      });
      setPositions(updated);
    }
  }, [chartData, positions.length]);
  useEffect(() => { const closedPnl = tradeHistory.reduce((sum, t) => sum + t.pnl, 0); const openPnl = positions.reduce((sum, p) => sum + p.pnl, 0); setTotalPnl(closedPnl + openPnl); }, [tradeHistory, positions]);
  const openPosition = () => { if (!signal || signal.direction === 'HOLD') return; const id = \`POS-\${Date.now()}\`; const newPosition: Position = { id, pair: selectedPair, direction: signal.direction, entry: signal.entry, sl: signal.stopLoss, tp: signal.takeProfit, current: signal.entry, pnl: 0, pnlPercent: 0, opened: new Date().toISOString(), timeframe }; setPositions([...positions, newPosition]); };
  const closePosition = (id: string) => { const position = positions.find(p => p.id === id); if (!position || chartData.length === 0) return; const exit = chartData[chartData.length - 1].close; const pnl = position.direction === 'BUY' ? (exit - position.entry) / position.entry * 10000 * 1000 : (position.entry - exit) / position.entry * 10000 * 1000; const trade: Trade = { id: \`TRD-\${Date.now()}\`, pair: position.pair, direction: position.direction, entry: position.entry, exit, pnl, pnlPercent: pnl / (position.entry * 1000) * 100, reason: signal?.reasons[0] || 'Trade closed', opened: position.opened, closed: new Date().toISOString(), outcome: pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BREAKEVEN', timeframe: position.timeframe }; setTradeHistory([trade, ...tradeHistory]); setPositions(positions.filter(p => p.id !== id)); };
  const winRate = tradeHistory.length > 0 ? ((tradeHistory.filter(t => t.outcome === 'WIN').length / tradeHistory.length) * 100).toFixed(0) : '0';
  if (chartData.length === 0) return <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;
  return (
    <div className="dashboard">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1>Wyckoff + VPA + QPT + Fibonacci</h1>
          <a href="/settings" style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none' }}>Settings</a>
          <span style={{ padding: '4px 12px', background: 'var(--accent-green)', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>PAPER TRADING</span>
        </div>
        <div className="header-stats">
          <div className="stat"><div className="stat-label">Win Rate</div><div className="stat-value">{winRate}%</div></div>
          <div className="stat"><div className="stat-label">Total P/L</div><div className={\`stat-value \${totalPnl >= 0 ? 'positive' : 'negative'}\`}>{totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}</div></div>
        </div>
      </header>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <input type="text" placeholder="Search pairs..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} style={{ padding: '10px 14px', paddingLeft: '36px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', width: '200px' }} />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          {showDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', maxHeight: '250px', overflowY: 'auto', zIndex: 1000, marginTop: '4px' }}>
              {filteredPairs.map(pair => (
                <button key={pair} onClick={() => { setSelectedPair(pair); setSearchTerm(''); setShowDropdown(false); }} style={{ display: 'block', width: '100%', padding: '10px 14px', background: pair === selectedPair ? 'var(--accent-blue)' : 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}>{pair.replace('_', '/')}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px' }}>
          {TIMEFRAMES.map(tf => (
            <button key={tf.value} onClick={() => setTimeframe(tf.value)} style={{ padding: '6px 12px', background: timeframe === tf.value ? 'var(--accent-blue)' : 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: timeframe === tf.value ? '600' : '400' }}>{tf.label}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: '600' }}>{selectedPair.replace('_', '/')}</span>
          <span style={{ fontSize: '18px', color: chartData[chartData.length - 1].close >= chartData[chartData.length - 1].open ? 'var(--accent-green)' : 'var(--accent-red)' }}>{chartData[chartData.length - 1].close.toFixed(5)}</span>
          {loading && <span style={{ color: 'var(--text-muted)' }}>Loading...</span>}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {FOREX_PAIRS.slice(0, 15).map(pair => (
          <button key={pair} onClick={() => setSelectedPair(pair)} className={\`pair-tab \${selectedPair === pair ? 'active' : ''}\`} style={{ padding: '6px 10px', fontSize: '11px' }}>{pair.replace('_', '/')}</button>
        ))}
      </div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <span className="card-title">{selectedPair.replace('_', '/')} - {timeframe} with QPT + Fibonacci</span>
          {signal?.qpAnalysis && (
            <span style={{ padding: '4px 12px', background: signal.qpAnalysis.strength === 'STRONG' ? 'var(--success-bg)' : signal.qpAnalysis.strength === 'MODERATE' ? 'var(--warning-bg)' : 'var(--bg-secondary)', borderRadius: '4px', fontSize: '12px' }}>QPT: {signal.qpAnalysis.strength} ({signal.qpAnalysis.alignedPoints.length} Fib-aligned)</span>
          )}
        </div>
        <Chart data={chartData} signal={signal} />
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span><span style={{ color: 'var(--accent-green)' }}>┄┄┄</span> Support</span>
          <span><span style={{ color: '#ff4757)' }}>┄┄┄</span> Resistance</span>
          <span><span style={{ color: '#ffd43b)' }}>━━</span> Entry</span>
          <span><span style={{ color: '#5c7cfa)' }}>··</span> Fib Levels</span>
          <span><span style={{ color: '#ffd43b)' }}>--</span> QP Aligned</span>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className={\`card signal-card \${signal?.direction === 'BUY' ? 'buy' : signal?.direction === 'SELL' ? 'sell' : 'neutral'}\`}>
          <div className="card-header">
            <span className="card-title">Trade Signal</span>
            <span className={\`signal-direction \${signal?.direction?.toLowerCase() || 'neutral'}\`}>{signal?.direction || 'HOLD'}</span>
          </div>
          {signal && signal.direction !== 'HOLD' ? (
            <>
              <div className="card-value">{signal.entry.toFixed(5)}</div>
              <div className="card-subtitle">Confidence: {(signal.confidence * 100).toFixed(0)}%</div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                <div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stop Loss</div><div style={{ fontWeight: '600', color: 'var(--accent-red)' }}>{signal.stopLoss.toFixed(5)}</div></div>
                <div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Take Profit</div><div style={{ fontWeight: '600', color: 'var(--accent-green)' }}>{signal.takeProfit.toFixed(5)}</div></div>
                <div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>R:R</div><div style={{ fontWeight: '600' }}>1:{signal.riskReward}</div></div>
              </div>
              <button onClick={openPosition} style={{ marginTop: '16px', width: '100%', padding: '12px', background: 'var(--accent-green)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: '600', cursor: 'pointer' }}>📝 OPEN POSITION (PAPER)</button>
            </>
          ) : (<div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No signal - Waiting for alignment</div>)}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Signal Reasoning</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {signal?.reasons.map((reason, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>{i +