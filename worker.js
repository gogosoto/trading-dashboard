export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // API Endpoints
    if (url.pathname === '/api/pairs') {
      // Return list of available pairs
      return new Response(JSON.stringify({
        pairs: [
          'EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'AUD_USD',
          'USD_CAD', 'NZD_USD', 'EUR_GBP', 'EUR_JPY', 'GBP_JPY',
          'EUR_CHF', 'AUD_JPY', 'CAD_JPY', 'CHF_JPY', 'EUR_AUD',
          'EUR_CAD', 'GBP_CHF', 'AUD_CAD', 'AUD_NZD', 'EUR_NZD',
          'GBP_AUD', 'GBP_CAD', 'NZD_JPY', 'EUR_SEK', 'USD_SEK'
        ]
      }), { headers });
    }

    if (url.pathname.startsWith('/api/candles/')) {
      const pair = url.pathname.replace('/api/candles/', '').toUpperCase();
      const timeframe = url.searchParams.get('timeframe') || 'M5';
      const count = parseInt(url.searchParams.get('count') || '100');

      // Check for OANDA credentials
      if (!env.OANDA_API_KEY || !env.OANDA_ACCOUNT_ID) {
        return new Response(JSON.stringify({
          error: 'OANDA credentials not configured',
          pair,
          sample: true,
          data: generateSampleCandles(pair, count)
        }), { headers });
      }

      try {
        // Fetch from OANDA
        const response = await fetch(
          `https://api-fxpractice.oanda.com/v3/instruments/${pair}/candles?granularity=${timeframe}&count=${count}`,
          {
            headers: {
              'Authorization': `Bearer ${env.OANDA_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`OANDA API error: ${response.status}`);
        }

        const oandaData = await response.json();
        const candles = oandaData.candles.map((c: any) => ({
          time: c.time,
          open: parseFloat(c.mid.o),
          high: parseFloat(c.mid.h),
          low: parseFloat(c.mid.l),
          close: parseFloat(c.mid.c),
          volume: c.volume
        }));

        return new Response(JSON.stringify({
          pair,
          timeframe,
          count: candles.length,
          data: candles,
          sample: false
        }), { headers });

      } catch (error: any) {
        // Fall back to sample data on error
        return new Response(JSON.stringify({
          error: error.message,
          pair,
          sample: true,
          data: generateSampleCandles(pair, count)
        }), { headers });
      }
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        oandaConfigured: !!(env.OANDA_API_KEY && env.OANDA_ACCOUNT_ID)
      }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { 
      status: 404, 
      headers 
    });
  }
};

// Generate sample candles when OANDA is not configured
function generateSampleCandles(pair: string, count: number) {
  const data = [];
  let price = getBasePrice(pair);
  const now = new Date();

  for (let i = count; i >= 0; i--) {
    const time = new Date(now);
    time.setMinutes(time.getMinutes() - i * 5);
    
    const volatility = pair.includes('JPY') ? 0.3 : 0.0015;
    const change = (Math.random() - 0.5) * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.2;
    const low = Math.min(open, close) - Math.random() * volatility * 0.2;
    
    data.push({
      time: time.toISOString(),
      open: parseFloat(open.toFixed(getDecimals(pair))),
      high: parseFloat(high.toFixed(getDecimals(pair))),
      low: parseFloat(low.toFixed(getDecimals(pair))),
      close: parseFloat(close.toFixed(getDecimals(pair))),
      volume: Math.floor(Math.random() * 1000) + 100
    });
    
    price = close;
  }
  
  return data;
}

function getBasePrice(pair: string): number {
  const prices: Record<string, number> = {
    'EUR_USD': 1.0850, 'GBP_USD': 1.2700, 'USD_JPY': 156.50,
    'USD_CHF': 0.8850, 'AUD_USD': 0.6550, 'USD_CAD': 1.3650,
    'NZD_USD': 0.6050, 'EUR_GBP': 0.8550, 'EUR_JPY': 169.80,
    'GBP_JPY': 198.80, 'EUR_CHF': 0.9650, 'AUD_JPY': 102.50,
    'CAD_JPY': 114.60, 'CHF_JPY': 176.80, 'EUR_AUD': 1.6560,
    'EUR_CAD': 1.4810, 'GBP_CHF': 1.1240, 'AUD_CAD': 0.8940,
    'AUD_NZD': 1.0820, 'EUR_NZD': 1.7920, 'GBP_AUD': 1.9380,
    'GBP_CAD': 1.7330, 'NZD_JPY': 94.70, 'EUR_SEK': 11.45,
    'USD_SEK': 10.55
  };
  return prices[pair] || 1.0;
}

function getDecimals(pair: string): number {
  return pair.includes('JPY') ? 3 : 5;
}
