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
const COINGECKO_PRICE_CHARTS = 'https://www.coingecko.com/price_charts';
const ALLOWED_CURRENCIES = ['usd', 'idr', 'btc', 'eth'];
const ALLOWED_DAYS = ['7', '14', '30', '60', '90']; // Nilai hari yang didukung

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  try {
    // Rate Limiting
    const ip = request.ip || '127.0.0.1';
    await rateLimiter.consume(ip);

    // Ekstrak parameter dari URL
    const { params: urlParams } = params;
    
    // Log untuk debugging
    console.log('URL params:', urlParams);
    
    if (urlParams.length < 3) {
      return NextResponse.json(
        { error: 'Invalid URL format. Expected: /api/memecoin/chart/{coinId}/{currency}/{days}_days.json' },
        { status: 400 }
      );
    }

    const coinId = urlParams[0];
    const currency = urlParams[1];
    
    // Ekstrak days dari format {days}_days.json
    const daysMatch = urlParams[2].match(/^(\d+)_days\.json$/);
    if (!daysMatch) {
      return NextResponse.json({ error: 'Invalid days format' }, { status: 400 });
    }
    const days = daysMatch[1];

    // Validasi parameter
    if (!ALLOWED_CURRENCIES.includes(currency.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    // Validasi days
    if (!ALLOWED_DAYS.includes(days)) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Allowed values: 7, 14, 30, 60, 90' },
        { status: 400 }
      );
    }

    // Cek cache
    const cacheKey = `chart-${coinId}-${currency}-${days}`;
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
      return NextResponse.json(cache[cacheKey].data);
    }

    // Fetch dari CoinGecko
    const url = `${COINGECKO_PRICE_CHARTS}/${coinId}/${currency}/${days}_days.json`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch chart data: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch chart data for ${coinId}`);
    }

    const data = await response.json();

    // Update cache
    cache[cacheKey] = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chart data error:', error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}