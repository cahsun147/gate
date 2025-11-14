// app/api/memecoin/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Konfigurasi Rate Limiter
const rateLimiter = new RateLimiterMemory({
  points: 20, // 20 permintaan
  duration: 60, // per menit per IP
});

// Sistem Cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 menit

// Konfigurasi API CoinGecko
const COINGECKO_API = 'https://www.coingecko.com/en/charts/categories/meme-token';
const COINGECKO_API_V3 = 'https://api.coingecko.com/api/v3';
const ALLOWED_DURATIONS = ['h24', 'd7', 'd14', 'm1', 'm3', 'ytd', 'y1', 'max'];
const ALLOWED_CURRENCIES = ['usd', 'idr', 'btc', 'eth'];

// Ganti handler menjadi GET (nama fungsi yang valid untuk Next.js Route)
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const { searchParams, pathname } = new URL(request.url);
  const ip = request.ip || '127.0.0.1';

  try {
    // Rate Limiting
    await rateLimiter.consume(ip);

    // Handle Top Coins
    if (slug === 'topcoin') {
      const vsCurrency = searchParams.get('vs_currency') || 'usd';
      
      // Validasi mata uang
      if (!ALLOWED_CURRENCIES.includes(vsCurrency.toLowerCase())) {
        return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
      }

      // Cek cache
      const cacheKey = `topcoin-${vsCurrency}`;
      if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
        return NextResponse.json(cache[cacheKey].data);
      }

      // Fetch dari CoinGecko
      const response = await fetch(
        `${COINGECKO_API_V3}/coins/markets?vs_currency=${vsCurrency}&category=meme-token&order=market_cap_desc&per_page=250&page=1&sparkline=false`
      );
      
      if (!response.ok) throw new Error('Failed to fetch top coins data');
      
      const data = await response.json();
      
      // Update cache
      cache[cacheKey] = { data, timestamp: Date.now() };
      return NextResponse.json(data);
    }

    // Handle Heatmap Data
    if (slug === 'categories_heatmap_data') {
      const vsCurrency = searchParams.get('vs_currency') || 'usd';
      
      // Validasi mata uang
      if (!ALLOWED_CURRENCIES.includes(vsCurrency.toLowerCase())) {
        return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
      }

      // Cek cache
      const cacheKey = `heatmap-${vsCurrency}`;
      if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
        return NextResponse.json(cache[cacheKey].data);
      }

      // Fetch dari CoinGecko
      const response = await fetch(`${COINGECKO_API}/categories_heatmap_data?vs_currency=${vsCurrency}`);
      if (!response.ok) throw new Error('Failed to fetch heatmap data');

      const data = await response.json();

      // Update cache
      cache[cacheKey] = { data, timestamp: Date.now() };
      return NextResponse.json(data);
    }

    // Handle Market Cap Chart
    if (slug === 'market-cap-chart') {
      const duration = searchParams.get('duration') || 'm1';
      const vsCurrency = searchParams.get('vs_currency') || 'usd';

      // Validasi parameter
      if (!ALLOWED_DURATIONS.includes(duration) || !ALLOWED_CURRENCIES.includes(vsCurrency.toLowerCase())) {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
      }

      // Cek cache
      const cacheKey = `chart-${duration}-${vsCurrency}`;
      if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
        return NextResponse.json(cache[cacheKey].data);
      }

      // Fetch dari CoinGecko
      const response = await fetch(`${COINGECKO_API}/categories_market_cap_chart_data?duration=${duration}&vs_currency=${vsCurrency}`);
      if (!response.ok) throw new Error('Failed to fetch chart data');
      
      const data = await response.json();
      
      // Update cache
      cache[cacheKey] = { data, timestamp: Date.now() };
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// Dukungan untuk metode OPTIONS - juga perlu diganti menjadi OPTIONS
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}