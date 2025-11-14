"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  FaGlobe,
  FaXTwitter,
  FaTelegram,
  FaMedium,
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaReddit,
  FaChevronDown,
  FaDiscord,
  FaLock, 
  FaLockOpen,
  FaEye, FaFilter
} from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { FilterDialog } from "@/components/filter-dialog";
import { CiSearch } from "react-icons/ci";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    deployer: string;
    mintable: string;
    freezeable: string;
    dev_best_token: string;
    dev_best_ath_usd: number;
    airdrop_percentage: number;
    dev_total_launches: number;
    bundled_buy_percentage: number;
    holder_count: number;
    last_updated: string;
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
  security: SecurityDetails;
  socialLinks: {
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
  };
  swapCount24h: number;
}

interface FilterValues {
  pool: { min: string; max: string };
  liquidity: { min: string; max: string };
  fdv: { min: string; max: string };
  vol: { min: string; max: string };
  txn: { min: string; max: string; period: string };
  buy: { min: string; max: string; period: string };
  sell: { min: string; max: string; period: string };
  sortBy: string;
  isActive: boolean;
}

const defaultFilterValues: FilterValues = {
  pool: { min: '', max: '' },
  liquidity: { min: '', max: '' },
  fdv: { min: '', max: '' },
  vol: { min: '', max: '' },
  txn: { min: '', max: '', period: '24h' },
  buy: { min: '', max: '', period: '24h' },
  sell: { min: '', max: '', period: '24h' },
  sortBy: '24h',
  isActive: false
};

export default function PumpFun() {
  const [pools, setPools] = useState<CombinedPoolData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [loading, setLoading] = useState(true);
  const [isChangingPeriod, setIsChangingPeriod] = useState(false);
  const previousDataRef = useRef<CombinedPoolData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    next: string | null;
    prev: string | null;
    last: {
      meta: {
        series: (string | number)[];
      };
    } | null;
  }>({
    next: null,
    prev: null,
    last: null
  });
  const [activeFilters, setActiveFilters] = useState<FilterValues>(defaultFilterValues);

  useEffect(() => {
    let isSubscribed = true;
    let timeoutId: NodeJS.Timeout;

    const fetchPools = async (isInitialLoad: boolean = false) => {
      try {
        if (isInitialLoad && pools.length === 0 || isChangingPeriod) {
          setLoading(true);
        }

        // Gunakan URL dari pagination jika ada
        let url;
        if (isChangingPeriod) {
          url = `/api/pump-fun-combined?period=${selectedPeriod}&page=1`;
        } else if (pagination.next && currentPage > Number(pagination.last?.meta?.series[0])) {
          url = pagination.next.replace('https://app.geckoterminal.com/api/p1', '/api');
        } else if (pagination.prev && currentPage < Number(pagination.last?.meta?.series[0])) {
          url = pagination.prev.replace('https://app.geckoterminal.com/api/p1', '/api');
        } else {
          url = `/api/pump-fun-combined?period=${selectedPeriod}&page=${currentPage}`;
        }

        // Only add filters to URL if they are active and have values
        if (activeFilters.isActive) {
          const queryParams = new URLSearchParams();
          
          // Volume filter
          if (activeFilters.vol.min) queryParams.append('volume_24h[gte]', activeFilters.vol.min);
          if (activeFilters.vol.max) queryParams.append('volume_24h[lte]', activeFilters.vol.max);
          
          // Liquidity filter
          if (activeFilters.liquidity.min) queryParams.append('liquidity[gte]', activeFilters.liquidity.min);
          if (activeFilters.liquidity.max) queryParams.append('liquidity[lte]', activeFilters.liquidity.max);
          
          // FDV filter
          if (activeFilters.fdv.min) queryParams.append('fdv_in_usd[gte]', activeFilters.fdv.min);
          if (activeFilters.fdv.max) queryParams.append('fdv_in_usd[lte]', activeFilters.fdv.max);
          
          // Pool age filter
          if (activeFilters.pool.min) queryParams.append('pool_creation_hours_ago[gte]', activeFilters.pool.min);
          if (activeFilters.pool.max) queryParams.append('pool_creation_hours_ago[lte]', activeFilters.pool.max);
          
          // TXN filter with period
          if (activeFilters.txn.min) queryParams.append(`tx_count_${activeFilters.txn.period}[gte]`, activeFilters.txn.min);
          if (activeFilters.txn.max) queryParams.append(`tx_count_${activeFilters.txn.period}[lte]`, activeFilters.txn.max);
          
          // Buy filter with period
          if (activeFilters.buy.min) queryParams.append(`buys_${activeFilters.buy.period}[gte]`, activeFilters.buy.min);
          if (activeFilters.buy.max) queryParams.append(`buys_${activeFilters.buy.period}[lte]`, activeFilters.buy.max);
          
          // Sell filter with period
          if (activeFilters.sell.min) queryParams.append(`sells_${activeFilters.sell.period}[gte]`, activeFilters.sell.min);
          if (activeFilters.sell.max) queryParams.append(`sells_${activeFilters.sell.period}[lte]`, activeFilters.sell.max);

          const filterParams = queryParams.toString();
          if (filterParams) {
            url += `&${filterParams}`;
          }
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const { data, links } = await response.json();
        
        if (isSubscribed) {
          // Simpan data pagination
          setPagination({
            next: links.next,
            prev: links.prev,
            last: links.last
          });

          previousDataRef.current = pools;

          if (data && Array.isArray(data)) {
            setPools(data);
          }
        }
      } catch (error) {
        console.error('Error fetching pools:', error);
      } finally {
        if (isSubscribed) {
          setLoading(false);
          setIsChangingPeriod(false);
          timeoutId = setTimeout(() => fetchPools(false), 15000);
        }
      }
    };

    fetchPools(true);

    return () => {
      isSubscribed = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [selectedPeriod, currentPage, activeFilters]);

  const handlePageChange = (page: number) => {
    // Pastikan page valid
    if (pagination.last?.meta?.series.includes(page) || 
        pagination.last?.meta?.series.includes(page.toString())) {
      setCurrentPage(page);
    }
  };

  // Only show loading when there's no data at all
  const showLoading = loading && pools.length === 0 && previousDataRef.current.length === 0;

  // Helper functions
  const formatPercent = (value: string) => {
    const num = parseFloat(value);
    const formatted = num.toFixed(2);
    const color = num >= 0 ? 'text-green-500' : 'text-red-500';
    return <span className={color}>{num >= 0 ? `+${formatted}%` : `${formatted}%`}</span>;
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  const formatAge = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const daysDiff = differenceInDays(now, date);
      
      let ageText = '';
      let isNew = false;
  
      if (daysDiff >= 30) {
        const months = Math.floor(daysDiff / 30);
        ageText = `${months}M`;
      } else if (daysDiff >= 7) {
        const weeks = Math.floor(daysDiff / 7);
        ageText = `${weeks}W`;
      } else if (daysDiff >= 1) {
        ageText = `${daysDiff}d`;
        isNew = true;
      } else {
        const timeDiffMs = now.getTime() - date.getTime();
        const hours = Math.floor(timeDiffMs / (1000 * 60 * 60));
        
        if (hours >= 1) {
          ageText = `${hours}h`;
        } else {
          const minutes = Math.floor(timeDiffMs / (1000 * 60));
          ageText = `${minutes}m`;
        }
        isNew = true;
      }
  
      return <span className={isNew ? 'text-green-500' : ''}>{ageText}</span>;
    } catch {
      return 'N/A';
    }
  };

  const SocialLinks = ({ pool }: { pool: CombinedPoolData }) => (
    <div className="flex gap-1 mt-1">
      {pool.socialLinks.websites[0] && (
        <a href={pool.socialLinks.websites[0]} target="_blank" rel="noopener noreferrer">
          <FaGlobe className="text-gray-400 hover:text-white" size={12} />
        </a>
      )}
      {pool.socialLinks.twitter_handle && (
        <a href={`https://x.com/${pool.socialLinks.twitter_handle}`} target="_blank" rel="noopener noreferrer">
          <FaXTwitter className="text-gray-400 hover:text-white" size={12} />
        </a>
      )}      
      {pool.socialLinks.discord_url && (
        <a href={pool.socialLinks.discord_url} target="_blank" rel="noopener noreferrer">
          <FaDiscord className="text-gray-400 hover:text-white" size={12} />
        </a>
      )}
      {pool.socialLinks.subreddit_handle && (
        <a href={`https://www.reddit.com/r/${pool.socialLinks.subreddit_handle}`} target="_blank" rel="noopener noreferrer">
          <FaReddit className="text-gray-400 hover:text-white" size={12} />
        </a>
      )}
      {pool.socialLinks.subreddit_handle && (
        <a href={`https://www.reddit.com/r/${pool.socialLinks.subreddit_handle}`} target="_blank" rel="noopener noreferrer">
          <FaReddit className="text-gray-400 hover:text-white" size={12} />
        </a>
      )}
      {pool.socialLinks.telegram_handle && (
        <a href={`https://t.me/${pool.socialLinks.telegram_handle}`} target="_blank" rel="noopener noreferrer">
          <FaTelegramPlane className="text-gray-400 hover:text-white" size={12} />
        </a>
      )}
    </div>
  );

  const SecurityScore = ({ security, pool }: { security: CombinedPoolData['security']; pool: CombinedPoolData }) => {
    const [open, setOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
  
    const formatCurrency = (value: number) => {
      if (value >= 1e9) return `$${(value/1e9).toFixed(2)}B`;
      if (value >= 1e6) return `$${(value/1e6).toFixed(2)}M`;
      if (value >= 1e3) return `$${(value/1e3).toFixed(2)}K`;
      return `$${value.toFixed(2)}`;
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-4 w-4">
            <FaEye className="h-2 w-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[85vw] max-w-[80%] max-h-[60vh] overflow-y-auto bg-gray-950 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-lg">{pool.name} Security Analysis</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 px-1 sm:gap-3">
            {/* Banner Section */}
            {pool.socialLinks.banner_url && pool.socialLinks.banner_url !== 'missing.png' && (
              <div className="col-span-4 rounded-lg aspect-[2/1] sm:aspect-[3/1] relative bg-gradient-to-r from-gray-800 to-gray-900">
                <img 
                  src={pool.socialLinks.banner_url} 
                  alt="Banner"
                  className="w-full h-full object-cover object-center absolute inset-0"
                />
              </div>
            )}
  
            {/* Token Info Section */}
            <div className="col-span-4 bg-gray-900 p-3 sm:p-4 rounded-lg shadow-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <img 
                  src={pool.imageUrl} 
                  alt={pool.name}
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-purple-500"
                />
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
                    {pool.name}
                    <span className="text-sm sm:text-lg text-purple-400 ml-1 sm:ml-2">({pool.symbol})</span>
                  </h1>
                  <div className="relative">
                    <p className={`text-xs sm:text-sm text-gray-300 mt-1 sm:mt-2 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                      {pool.socialLinks.description}
                    </p>
                    {pool.socialLinks.description.length > 150 && (
                      <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-purple-400 text-xs mt-1 hover:underline"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* GT Score Section */}
            <div className="col-span-4 lg:col-span-2 bg-gray-900 p-3 sm:p-4 rounded-lg shadow-lg">
            <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-100">Security Score</h2>
              <div className="flex flex-col gap-4">
                <div className={cn(
                  "text-2xl font-bold px-4 py-2 rounded-full w-fit",
                  security.gtScore >= 70 ? "bg-green-500/20 text-green-400" :
                  security.gtScore >= 40 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                )}>
                  {security.gtScore.toFixed(1)}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(security.gtScoreDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <span className="capitalize text-gray-400 text-xs sm:text-sm">{key}:</span>
                      <span className="font-medium text-gray-100 text-xs sm:text-sm">{value}/100</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-4 lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Soul Scanner */}
              {security.soul_scanner && (
                <div className="bg-gray-900 p-3 sm:p-4 rounded-lg shadow-lg">
                  <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-100">Soul Scanner</h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-gray-800 rounded">
                      <span className="text-gray-400">Holders</span>
                      <span className="block font-medium text-gray-100">
                        {security.soul_scanner.holder_count.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2 bg-gray-800 rounded">
                      <span className="text-gray-400">Bundled Buy</span>
                      <span className="block text-red-400">
                        {security.soul_scanner.bundled_buy_percentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Liquidity Lock */}
              {security.lockedLiquidity && (
                <div className="bg-gray-900 p-3 sm:p-4 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    {security.lockedLiquidity.locked_percent >= 80 ? (
                      <FaLock className="text-green-400 text-sm sm:text-base" />
                    ) : (
                      <FaLockOpen className="text-yellow-400 text-sm sm:text-base" />
                    )}
                    <h2 className="text-base sm:text-lg font-semibold text-gray-100">Liquidity Lock</h2>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span className={cn(
                      "text-xl font-semibold",
                      security.lockedLiquidity.locked_percent >= 80 ? "text-green-400" :
                      security.lockedLiquidity.locked_percent >= 50 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {security.lockedLiquidity.locked_percent}%
                    </span>
                    <Button 
                      variant="outline" 
                      asChild 
                      size="sm"
                      className="text-xs h-7 px-2 bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                    >
                      <a href={security.lockedLiquidity.url} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-1">
                          <span>RugCheck</span>
                        </div>
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Reports */}
              {security.securityLinks.length > 0 && (
                <div className="bg-gray-900 p-3 sm:p-4 rounded-lg shadow-lg">
                  <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-100">Security Reports</h3>
                  <div className="flex flex-wrap gap-2">
                    {security.securityLinks.map((link, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        asChild 
                        size="sm"
                        className="text-xs h-7 px-2 bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
    
            {/* Market Data */}
            <div className="col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">24h Volume</div>
                <div className="text-xl font-bold">
                  {formatCurrency(parseFloat(pool.volume))}
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Liquidity</div>
                <div className="text-xl font-bold">
                  {formatCurrency(parseFloat(pool.liquidity))}
                </div>
              </div>
  
              <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Market Cap</div>
                <div className="text-xl font-bold">
                  {formatCurrency(pool.marketCapToHolder)}
                </div>
              </div>
  
              <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Holders</div>
                <div className="text-xl font-bold">
                  {security.soul_scanner?.holder_count.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const handleFilterChange = (
    field: keyof Omit<FilterValues, 'isActive' | 'sortBy'>,
    subField: 'min' | 'max' | 'period',
    value: string
  ) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value
      }
    }));
  };

  const handleApplyFilters = async () => {
    try {
      setActiveFilters(prev => ({ ...prev, isActive: true }));
      setCurrentPage(1);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  const renderTabs = () => {
    return (
      <div className="flex justify-center items-center gap-2 mb-4">
        <Tabs 
          value={selectedPeriod}
          onValueChange={(value) => {
            setSelectedPeriod(value);
            setIsChangingPeriod(true);
            // Update active filters period if no filter is active
            if (!activeFilters.isActive) {
              setActiveFilters({
                ...defaultFilterValues,
                sortBy: value,
                txn: { ...defaultFilterValues.txn, period: value },
                buy: { ...defaultFilterValues.buy, period: value },
                sell: { ...defaultFilterValues.sell, period: value }
              });
            }
          }}
        >
          <TabsList className="bg-black border border-purple-400/20 h-8">
            <TabsTrigger value="5m" className="data-[state=active]:bg-purple-400/20">5M</TabsTrigger>
            <TabsTrigger value="1h" className="data-[state=active]:bg-purple-400/20">1H</TabsTrigger>
            <TabsTrigger value="6h" className="data-[state=active]:bg-purple-400/20">6H</TabsTrigger>
            <TabsTrigger value="24h" className="data-[state=active]:bg-purple-400/20">24H</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  };

  // Fungsi untuk menerapkan filter
  const applyFilters = (pool: CombinedPoolData) => {
    if (!activeFilters.isActive) return true;

    const numericValue = (val: string) => val ? parseFloat(val) : null;
    
    // Filter Liquidity
    const liquidityValue = parseFloat(pool.liquidity);
    const minLiq = numericValue(activeFilters.liquidity.min);
    const maxLiq = numericValue(activeFilters.liquidity.max);
    if (minLiq !== null && liquidityValue < minLiq) return false;
    if (maxLiq !== null && liquidityValue > maxLiq) return false;

    // Filter Volume
    const volumeValue = parseFloat(pool.volume);
    const minVol = numericValue(activeFilters.vol.min);
    const maxVol = numericValue(activeFilters.vol.max);
    if (minVol !== null && volumeValue < minVol) return false;
    if (maxVol !== null && volumeValue > maxVol) return false;

    // Filter FDV
    const fdvValue = pool.fdv;
    const minFdv = numericValue(activeFilters.fdv.min);
    const maxFdv = numericValue(activeFilters.fdv.max);
    if (minFdv !== null && fdvValue < minFdv) return false;
    if (maxFdv !== null && fdvValue > maxFdv) return false;

    // Filter TXN (swap count)
    const txnValue = pool.swapCount24h;
    const minTxn = numericValue(activeFilters.txn.min);
    const maxTxn = numericValue(activeFilters.txn.max);
    if (minTxn !== null && txnValue < minTxn) return false;
    if (maxTxn !== null && txnValue > maxTxn) return false;

    return true;
  };

  const resetFilter = (key: keyof FilterValues, currentFilters: FilterValues): FilterValues => {
    const newFilters = { ...currentFilters };
    const hasPeriod = key === 'txn' || key === 'buy' || key === 'sell';
    
    if (key !== 'isActive' && key !== 'sortBy') {
      newFilters[key] = {
        min: '',
        max: '',
        ...(hasPeriod ? { period: '24h' } : {})
      } as any;
    }
    
    return newFilters;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Trending</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pump Fun</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Filter dan Tabs */}
          <div className="flex items-center justify-between">
            <FilterDialog 
              currentPeriod={selectedPeriod}
              onApplyFilters={(filters) => {
                if (filters.isActive) {
                  if (filters.sortBy !== selectedPeriod) {
                    setSelectedPeriod(filters.sortBy);
                    setIsChangingPeriod(true);
                  }
                }
                setActiveFilters(filters);
              }}
            />

            <Tabs 
              value={selectedPeriod}
              onValueChange={(value) => {
                setSelectedPeriod(value);
                setIsChangingPeriod(true);
                if (!activeFilters.isActive) {
                  setActiveFilters({
                    ...defaultFilterValues,
                    sortBy: value,
                    txn: { ...defaultFilterValues.txn, period: value },
                    buy: { ...defaultFilterValues.buy, period: value },
                    sell: { ...defaultFilterValues.sell, period: value }
                  });
                }
              }}
              className="w-fit"
            >
              <TabsList className="bg-black border border-purple-400/20">
                <TabsTrigger value="5m" className="text-xs data-[state=active]:bg-purple-400/20 data-[state=active]:text-white">5M</TabsTrigger>
                <TabsTrigger value="1h" className="text-xs data-[state=active]:bg-purple-400/20 data-[state=active]:text-white">1H</TabsTrigger>
                <TabsTrigger value="6h" className="text-xs data-[state=active]:bg-purple-400/20 data-[state=active]:text-white">6H</TabsTrigger>
                <TabsTrigger value="24h" className="text-xs data-[state=active]:bg-purple-400/20 data-[state=active]:text-white">24H</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Pagination */}
          {pagination.last?.meta?.series && (
            <div className="flex justify-center w-full">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={cn(!pagination.prev && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  
                  {pagination.last.meta.series.map((page, index) => (
                    <PaginationItem key={index}>
                      {typeof page === 'string' && page.toLowerCase() === 'gap' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageChange(Number(page))}
                          isActive={currentPage === Number(page)}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={cn(!pagination.next && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Tabel */}
          <div className="rounded-xl bg-muted/50">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left text-xs sticky left-0 z-10 bg-muted/50 rounded-tl-xl">Pool</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap"></th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">Price</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">Age</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">TXN</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">5m</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">1h</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">6h</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">24h</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">VOL</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">LIQ</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">MCAP/HLDR</th>
                    <th className="p-2 text-left text-xs whitespace-nowrap">FDV</th>
                    <th className="p-2 text-center text-xs whitespace-nowrap sticky right-0 z-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {showLoading ? (
                    <tr>
                      <td colSpan={14} className="p-4 text-center text-xs">Loading...</td>
                    </tr>
                  ) : pools.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="p-4 text-center text-xs">No data available</td>
                    </tr>
                  ) : (
                    pools.filter(applyFilters).map((pool) => (
                      <tr key={pool.id} className="border-b hover:bg-muted/70">
                        <td className="p-4 sticky left-0 z-10 bg-muted/50 backdrop-blur-sm">
                          <div className="flex items-center justify-start gap-3">
                            <div className="relative w-8 h-8 flex-shrink-0">
                              <Image
                                src={pool.imageUrl || '/placeholder.png'}
                                alt={pool.name}
                                fill
                                className="rounded-full object-cover"
                                sizes="32px"
                                priority
                              />
                            </div>
                            <div className="flex flex-col">
                              <div className="font-medium text-xs flex items-center gap-2">
                                {pool.symbol}
                                <Tooltip>
                                  <TooltipTrigger>
                                    <CiSearch 
                                      className="cursor-pointer" 
                                      onClick={() => window.open(`https://x.com/search?q=${pool.pumpAddress}`, '_blank')}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Search on X</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="text-xs text-gray-400">{pool.name}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {pool.pumpAddress.slice(0, 6)}...{pool.pumpAddress.slice(-3)}
                                </span>
                                <Copy
                                  size={12}
                                  color="#0ee1c9"
                                  className="cursor-pointer"
                                  onClick={() => handleCopy(pool.pumpAddress)}
                                />
                                <SocialLinks pool={pool} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <SecurityScore security={pool.security} pool={pool} />
                        </td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">${parseFloat(pool.price).toFixed(4)}</td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">{formatAge(pool.age)}</td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">
                          {pool.swapCount24h.toLocaleString() || '-'}
                        </td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">{formatPercent(pool.changes['5m'])}</td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">{formatPercent(pool.changes['1h'])}</td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">{formatPercent(pool.changes['6h'])}</td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">{formatPercent(pool.changes['24h'])}</td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">{formatCurrency(pool.volume)}</td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">{formatCurrency(pool.liquidity)}</td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">{formatCurrency(pool.marketCapToHolder)}</td>
                        <td className="p-2 text-left text-xs whitespace-nowrap">{formatCurrency(pool.fdv)}</td>
                        <td className="p-2 text-center">
                          <a 
                            href={`https://t.me/maestro?start=${pool.pumpAddress}-garekcos`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                          >
                            BUY
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}