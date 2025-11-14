import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Cache for storing API responses with shorter duration
let apiCache: {
  [key: string]: {
    data: any;
    timestamp: number;
  };
} = {};

const CACHE_DURATION = 2000; 

async function fetchWithRetry(url: string, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.geckoterminal.com/'
        },
        cache: 'no-store'
      });

      // Handle Cloudflare challenge
      if (response.status === 403 || response.status === 503) {
        console.error(`Cloudflare challenge detected for ${url}`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }

      // Handle rate limiting
      if (response.status === 429) {
        console.error(`Rate limit hit for ${url}`);
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
        continue;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} for ${url}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
    }
  }
  throw new Error(`Failed after ${retries} retries`);
}

interface SecurityDetails {
  gtScore: number;
  gtScoreDetails: {
    info: number;
    pool: number;
    transactions: number;
    holders: number;
    creation: number;
  };
  soul_scanner?: {
    deployer: string | null;
    mintable: string;
    freezeable: string;
    devBestToken: string | null;
    devBestATH: number | null;
    airdropPercentage: number;
    devLaunches: number;
    bundledBuyPercentage: number;
    holderCount: number;
    lastUpdated: string;
  };
  lockedLiquidity: {
    locked_percent: number;
    next_unlock_percent: number;
    next_unlock_timestamp: string | null;
    final_unlock_timestamp: string | null;
    source: string;
    url: string;
  } | null;
  sentimentVotes: {
    total: number;
    up_percentage: number;
    down_percentage: number;
  };
  securityLinks: {
    name: string;
    category: string;
    url: string;
    image_url: string;
  }[];
}

interface SocialLinks {
  websites: string[];
  discord_url: string | null;
  twitter_handle: string | null;
  telegram_handle: string | null;
  medium_handle: string | null;
  github_repo_name: string | null;
  subreddit_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  facebook_handle: string | null;
  instagram_handle: string | null;
  description: string;
  banner_url?: string;
  metadata?: string;
  cto?: string | null;
}

interface CombinedPoolData {
  id: string;
  baseTokenId: string;
  name: string;
  symbol: string;
  imageUrl: string;
  pumpAddress: string;
  poolAddress: string;
  price: string;
  age: string;
  volume: string;
  liquidity: string;
  marketCapToHolder: number;
  fdv: number;
  changes: {
    '5m': string;
    '15m': string;
    '30m': string;
    '1h': string;
    '6h': string;
    '24h': string;
  };
  socialLinks: SocialLinks;
  security: SecurityDetails;
  swapCount24h: number;
}

export async function GET(request: Request) {
  let cacheKey = '';
  const useCache = true;
  
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';
    const pageNumber = Number(searchParams.get('page') || '1');

    // Build the URL with filters
    const apiBaseUrl = 'https://app.geckoterminal.com/api/p1/tags/pump-fun/pools';
    const queryParams = new URLSearchParams();

    // Add base parameters
    queryParams.append('page', pageNumber.toString());
    queryParams.append('include', 'dex.network,tokens');
    queryParams.append('sort', `-${period}_trend_score`);

    // Handle pool age filter
    const poolAgeMin = searchParams.get('pool_creation_hours_ago[gte]');
    const poolAgeMax = searchParams.get('pool_creation_hours_ago[lte]');
    
    if (poolAgeMin) {
      queryParams.append('pool_creation_hours_ago[gte]', poolAgeMin);
    }
    if (poolAgeMax) {
      queryParams.append('pool_creation_hours_ago[lte]', poolAgeMax);
    }

    // Handle other filters
    const filterParams = [
      'volume_24h',
      'liquidity',
      'fdv_in_usd',
      'tx_count_24h',
      'tx_count_1h',
      'tx_count_6h',
      'tx_count_5m',
      'buys_24h',
      'buys_1h',
      'buys_6h',
      'buys_5m',
      'sells_24h',
      'sells_1h',
      'sells_6h',
      'sells_5m'
    ];

    filterParams.forEach(key => {
      const minValue = searchParams.get(`${key}[gte]`);
      const maxValue = searchParams.get(`${key}[lte]`);
      
      if (minValue) {
        queryParams.append(`${key}[gte]`, minValue);
      }
      if (maxValue) {
        queryParams.append(`${key}[lte]`, maxValue);
      }
    });

    const url = `${apiBaseUrl}?${queryParams.toString()}`;
    console.log('Fetching URL:', url); // For debugging

    cacheKey = `pump-fun-${period}-${pageNumber}-${queryParams.toString()}`;
    const now = Date.now();
    
    if (useCache && apiCache[cacheKey] && now - apiCache[cacheKey].timestamp < CACHE_DURATION) {
      return NextResponse.json(apiCache[cacheKey].data);
    }

    const poolsData = await fetchWithRetry(url);

    // Jika tidak ada data, return format yang konsisten
    if (!poolsData.data || poolsData.data.length === 0) {
      return NextResponse.json({
        data: [],
        links: {
          first: `/api/pump-fun-combined?period=${period}&page=1`,
          prev: null,
          next: null,
          last: { meta: { series: ["1"] } }
        }
      });
    }

    // Process data as before...
    const tokenMap = poolsData.included.reduce((acc: Record<string, any>, item: any) => {
      if (item.type === 'token') {
        acc[item.id] = item;
      }
      return acc;
    }, {});

    // Process pools in parallel batches
    const promises: Promise<any>[] = [];
    const BATCH_SIZE = 10;
    const DELAY_BETWEEN_BATCHES = 200;

    for (let i = 0; i < poolsData.data.length; i += BATCH_SIZE) {
      const batch = poolsData.data.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (pool: any) => {
        const baseTokenId = pool.attributes.base_token_id;
        const baseToken = tokenMap[baseTokenId];
        const tokenData = pool.attributes.token_value_data[baseTokenId];
        const poolAddress = pool.attributes.address;

        try {
          // Fetch detailed pool data with a single API call
          const poolDetails = await fetchWithRetry(
            `https://app.geckoterminal.com/api/p1/solana/pools/${poolAddress}?include=dex%2Cdex.network.explorers%2Cdex_link_services%2Cnetwork_link_services%2Cpairs%2Ctoken_link_services%2Ctokens.token_security_metric%2Ctokens.tags%2Cpool_locked_liquidities&base_token=0`
          );

          const securityAttributes = poolDetails.data?.attributes;
          const networkLinkServices = poolDetails.included?.filter((item: any) => 
            item.type === 'network_link_service' && 
            ['RugCheck', 'SolSniffer', 'QuillCheck', 'GateKept'].includes(item.attributes.name)
          );

          const tokenInfo = poolDetails.included?.find((item: any) => 
            item.type === 'token' && item.attributes.address === baseToken?.attributes?.address
          );

          const lockedLiquidity = poolDetails.included?.find((item: any) => 
            item.type === 'pool_locked_liquidity'
          );

          // Cari token security metric untuk token saat ini
          const tokenSecurityMetric = poolDetails.included?.find((item: any) => 
            item.type === 'token_security_metric' &&
            item.relationships?.token?.data?.id === baseTokenId
          );

          // Ekstrak data soul scanner
          const soulData = tokenSecurityMetric?.attributes?.soul_scanner_data || {};

          return {
            id: pool.id,
            baseTokenId: baseTokenId,
            name: baseToken?.attributes?.name || '',
            symbol: baseToken?.attributes?.symbol || '',
            imageUrl: baseToken?.attributes?.image_url || '',
            pumpAddress: baseToken?.attributes?.address || '',
            poolAddress: poolAddress,
            price: pool.attributes.price_in_usd,
            age: pool.attributes.pool_created_at,
            volume: pool.attributes.to_volume_in_usd,
            liquidity: pool.attributes.reserve_in_usd,
            marketCapToHolder: tokenData?.market_cap_to_holders_ratio || 0,
            fdv: tokenData?.fdv_in_usd || 0,
            changes: {
              '5m': pool.attributes.price_percent_changes.last_5m,
              '15m': pool.attributes.price_percent_changes.last_15m,
              '30m': pool.attributes.price_percent_changes.last_30m,
              '1h': pool.attributes.price_percent_changes.last_1h,
              '6h': pool.attributes.price_percent_changes.last_6h,
              '24h': pool.attributes.price_percent_changes.last_24h,
            },
            security: {
              gtScore: securityAttributes?.gt_score || 0,
              gtScoreDetails: {
                info: securityAttributes?.gt_score_details?.info || 0,
                pool: securityAttributes?.gt_score_details?.pool || 0,
                transactions: securityAttributes?.gt_score_details?.transactions || 0,
                holders: securityAttributes?.gt_score_details?.holders || 0,
                creation: securityAttributes?.gt_score_details?.creation || 0,
              },
              soul_scanner: tokenSecurityMetric ? {
                deployer: soulData.deployer || null,
                mintable: soulData.mintable || "0",
                freezeable: soulData.freezeable || "0",
                dev_best_token: soulData.dev_best_token || null,
                dev_best_ath_usd: soulData.dev_best_ath_usd || null,
                airdrop_percentage: soulData.airdrop_percentage || 0,
                dev_total_launches: soulData.dev_total_launches || 0,
                bundled_buy_percentage: soulData.bundled_buy_percentage || 0,
                holder_count: tokenSecurityMetric.attributes.holder_count || 0,
                last_updated: tokenSecurityMetric.attributes.soul_scanner_updated_at || ''
              } : undefined,
              lockedLiquidity: lockedLiquidity ? {
                locked_percent: lockedLiquidity.attributes.locked_percent,
                next_unlock_percent: lockedLiquidity.attributes.next_unlock_percent,
                next_unlock_timestamp: lockedLiquidity.attributes.next_unlock_timestamp,
                final_unlock_timestamp: lockedLiquidity.attributes.final_unlock_timestamp,
                source: lockedLiquidity.attributes.source,
                url: lockedLiquidity.attributes.url
              } : null,
              sentimentVotes: {
                total: securityAttributes?.sentiment_votes?.total || 0,
                up_percentage: securityAttributes?.sentiment_votes?.up_percentage || 0,
                down_percentage: securityAttributes?.sentiment_votes?.down_percentage || 0
              },
              securityLinks: networkLinkServices?.map((service: any) => ({
                name: service.attributes.name,
                category: service.attributes.category,
                url: service.attributes.url,
                image_url: service.attributes.image_url
              })) || []
            },
            socialLinks: {
              websites: tokenInfo?.attributes?.links?.websites || [],
              discord_url: tokenInfo?.attributes?.links?.discord_url,
              twitter_handle: tokenInfo?.attributes?.links?.twitter_handle,
              telegram_handle: tokenInfo?.attributes?.links?.telegram_handle,
              medium_handle: tokenInfo?.attributes?.links?.medium_handle,
              github_repo_name: tokenInfo?.attributes?.links?.github_repo_name,
              subreddit_handle: tokenInfo?.attributes?.links?.subreddit_handle,
              tiktok_handle: tokenInfo?.attributes?.links?.tiktok_handle,
              youtube_handle: tokenInfo?.attributes?.links?.youtube_handle,
              facebook_handle: tokenInfo?.attributes?.links?.facebook_handle,
              instagram_handle: tokenInfo?.attributes?.links?.instagram_handle,
              description: tokenInfo?.attributes?.description?.en || '',
              banner_url: tokenInfo?.attributes?.banner_image_url || null,
              metadata: tokenInfo?.attributes?.metadata_updated_at || '',
              cto: tokenInfo?.attributes?.cto || null
            },
            swapCount24h: pool.attributes.swap_count_24h || 0,
          };
        } catch (error) {
          console.error(`Error processing pool ${poolAddress}:`, error);
          return null;
        }
      });

      promises.push(...batchPromises);
      
      if (i + BATCH_SIZE < poolsData.data.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    const results = await Promise.all(promises);
    const validResults = results.filter(Boolean);

    // Update cache with the processed data
    const appBaseUrl = `/api/pump-fun-combined?period=${period}`;
    const series = poolsData.links.last?.meta?.series || ["1"];
    const totalPages = series.length;
    
    // Tentukan prev dan next berdasarkan posisi halaman saat ini
    let prevPage = null;
    let nextPage = null;
    
    // Cari index halaman saat ini dalam series
    const currentIndex = series.findIndex((p: string | number) => Number(p) === pageNumber);
    
    if (currentIndex > 0) {
      prevPage = `${appBaseUrl}&page=${series[currentIndex - 1]}`;
    }
    
    if (currentIndex < series.length - 1) {
      nextPage = `${appBaseUrl}&page=${series[currentIndex + 1]}`;
    }
    
    apiCache[cacheKey] = {
      data: {
        data: validResults,
        links: {
          first: `${appBaseUrl}&page=1`,
          prev: prevPage,
          next: nextPage,
          last: { 
            meta: { 
              series: series
            } 
          }
        }
      },
      timestamp: now
    };

    return NextResponse.json(apiCache[cacheKey].data);

  } catch (error) {
    console.error('API fetch error:', error);
    // Return consistent format even in error case
    return NextResponse.json({
      data: [],
      links: {
        first: `/api/pump-fun-combined?period=24h&page=1`,
        prev: null,
        next: null,
        last: { meta: { series: ["1"] } }
      }
    });
  }
}