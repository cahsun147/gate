"use client"

import { useEffect, useState } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Treemap } from 'recharts'

interface CoinData {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_24h: number
}

interface TreemapData {
  name: string
  size: number
  value: number
  fill: string
  image: string
}

interface ChartData {
  stats: [number, number][]
}

export default function Page() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([])
  const [chartLoading, setChartLoading] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null)
  const [selectedDays, setSelectedDays] = useState("30")
  const [selectedCurrency, setSelectedCurrency] = useState("usd")
  const [activeTab, setActiveTab] = useState("chart")

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch("/api/memecoin/topcoin?vs_currency=usd")
        const data = await response.json()
        setCoins(data)
        setLoading(false)
        
        // Set default selected coin to first coin in the list
        if (data.length > 0) {
          setSelectedCoin(data[0].id)
          fetchChartData(data[0].id, selectedDays)
        }
      } catch (error) {
        console.error("Error fetching coin data:", error)
        setLoading(false)
      }
    }

    fetchCoins()
  }, [])

  const fetchChartData = async (coinId: string, days: string) => {
    setChartLoading(true)
    try {
      const response = await fetch(`/api/memecoin/chart/${coinId}/${selectedCurrency}/${days}_days.json`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`)
      }
      
      const data: ChartData = await response.json()
      
      // Transform data for chart
      const formattedData = data.stats.map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        price
      }))
      
      setChartData(formattedData)
    } catch (error) {
      console.error("Error fetching chart data:", error)
      setChartData([])
    } finally {
      setChartLoading(false)
    }
  }

  const handleCoinSelect = (coinId: string) => {
    setSelectedCoin(coinId)
    fetchChartData(coinId, selectedDays)
    setActiveTab("chart")
  }

  const handleDaysChange = (days: string) => {
    setSelectedDays(days)
    if (selectedCoin) {
      fetchChartData(selectedCoin, days)
    }
  }

  // Fungsi untuk mendapatkan warna berdasarkan persentase perubahan
  const getPercentageColor = (percentage: number | undefined) => {
    if (!percentage) return "bg-gray-400" // Nilai default jika undefined
    if (percentage > 20) return "bg-green-600"
    if (percentage > 10) return "bg-green-500"
    if (percentage > 5) return "bg-green-400"
    if (percentage > 0) return "bg-green-300"
    if (percentage > -5) return "bg-red-300"
    if (percentage > -10) return "bg-red-400"
    if (percentage > -20) return "bg-red-500"
    return "bg-red-600"
  }

  // Fungsi untuk mendapatkan warna teks berdasarkan persentase perubahan
  const getTextColor = (percentage: number | undefined) => {
    if (!percentage) return "text-gray-500" // Nilai default jika undefined
    if (percentage > 0) return "text-green-500"
    return "text-red-500"
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
            <Breadcrumb>
              <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                  <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Top Memecoin</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
              <h1 className="text-2xl font-bold">Top Memecoin</h1>
            </div>
            <SidebarTrigger />
          </div>
          <Separator />
          
          {/* Tabs for Chart and Heatmap */}
          <div className="p-4 border-b">
            <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="chart">Price Chart</TabsTrigger>
                <TabsTrigger value="heatmap">Market Cap Treemap (Top 20)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart">
                <h2 className="text-xl font-semibold mb-4">Price Chart</h2>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    {selectedCoin && (
                      <p className="text-sm text-muted-foreground">
                        Showing data for: <span className="font-medium">{coins.find(c => c.id === selectedCoin)?.name || selectedCoin}</span>
                        {selectedCoin && (
                          <span className={coins.find(c => c.id === selectedCoin)?.price_change_percentage_24h ?? 0
                            ? "ml-2 text-green-500" 
                            : "ml-2 text-red-500"
                          }>
                            ({coins.find(c => c.id === selectedCoin)?.price_change_percentage_24h?.toFixed(2) || "0.00"}%)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <Tabs defaultValue={selectedDays} onValueChange={handleDaysChange}>
                    <TabsList>
                      <TabsTrigger value="7">7D</TabsTrigger>
                      <TabsTrigger value="30">30D</TabsTrigger>
                      <TabsTrigger value="60">60D</TabsTrigger>
                      <TabsTrigger value="90">90D</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="h-[300px] w-full">
                  {chartLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                          </linearGradient>
                          <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            // Show fewer ticks for better readability
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                          }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke={
                            (selectedCoin && (coins.find(c => c.id === selectedCoin)?.price_change_percentage_24h ?? 0) > 0)
                              ? "url(#colorPositive)"
                              : "url(#colorNegative)"
                          } 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No chart data available
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="heatmap">
                <h2 className="text-xl font-semibold mb-4">Market Cap Treemap (Top 20)</h2>
                <div className="h-[500px] w-full">
                  {loading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <Treemap
                        data={coins.slice(0, 20).map((coin) => ({
                          name: coin.symbol.toUpperCase(),
                          size: coin.market_cap,
                          value: coin.price_change_percentage_24h,
                          fill: coin.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444',
                          image: coin.image
                        }))}
                        dataKey="size"
                        aspectRatio={4/3}
                        stroke="#fff"
                        animationDuration={300}
                      >
                        {(props: { 
                          x: number; 
                          y: number; 
                          width: number; 
                          height: number; 
                          payload: TreemapData 
                        }) => {
                          const { x, y, width, height, payload } = props;
                          return width > 30 && height > 30 ? (
                            <g>
                              <rect
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                style={{
                                  fill: payload.fill,
                                  stroke: '#fff',
                                  strokeWidth: 2,
                                  strokeOpacity: 1,
                                }}
                              />
                              <text
                                x={x + width / 2}
                                y={y + height / 2}
                                textAnchor="middle"
                                fill="#fff"
                                fontSize={12}
                              >
                                <tspan x={x + width / 2} dy="-1.2em">
                                  <image
                                    href={payload.image}
                                    x={x + width / 2 - 8}
                                    y={y + height / 2 - 20}
                                    height="16"
                                    width="16"
                                  />
                                </tspan>
                                <tspan x={x + width / 2} dy="1.6em">{payload.name}</tspan>
                                <tspan x={x + width / 2} dy="1.2em" fontSize={10}>
                                  {payload.value > 0 ? '+' : ''}{payload.value.toFixed(2)}%
                                </tspan>
                              </text>
                            </g>
                          ) : null;
                        }}
                      </Treemap>
                    </ResponsiveContainer>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Coin Table */}
          <div className="flex-1 p-4 overflow-auto">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>Total Volume</TableHead>
                    <TableHead>24h Change</TableHead>
                    <TableHead>Chart</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coins.map((coin) => (
                    <TableRow 
                      key={coin.id} 
                      className={selectedCoin === coin.id ? "bg-muted/50" : ""}
                      onClick={() => handleCoinSelect(coin.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell>{coin.market_cap_rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full mr-2" />
                          {coin.name}
                        </div>
                      </TableCell>
                      <TableCell>{coin.symbol.toUpperCase()}</TableCell>
                      <TableCell>${coin.current_price.toLocaleString()}</TableCell>
                      <TableCell>${coin.market_cap.toLocaleString()}</TableCell>
                      <TableCell>${coin.total_volume.toLocaleString()}</TableCell>
                      <TableCell className={coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}>
                        {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                      </TableCell>
                      <TableCell>
                        <button 
                          className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCoinSelect(coin.id);
                          }}
                        >
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}