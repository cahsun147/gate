'use client';

import { useEffect, useState } from 'react';
import { Animator } from '@arwes/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styled from '@emotion/styled';

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

interface ChartData {
  stats: [number, number][];
}

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TabButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => (props.active ? 'rgba(0, 255, 255, 0.1)' : 'transparent')};
  border: 1px solid ${props => (props.active ? '#00ffff' : 'rgba(0, 255, 255, 0.2)')};
  color: ${props => (props.active ? '#00ffff' : '#ffffff')};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;

  &:hover {
    border-color: #00ffff;
    color: #00ffff;
  }
`;

const ContentBox = styled.div`
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 0.25rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  thead {
    border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  }

  th {
    padding: 0.75rem;
    text-align: left;
    color: #00ffff;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }

  td {
    padding: 0.75rem;
    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
    color: #ffffff;
  }

  tbody tr {
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      background: rgba(0, 255, 255, 0.05);
      border-left: 2px solid #00ffff;
    }
  }
`;

export default function TopMemecoinPage() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState('30');
  const [selectedCurrency, setSelectedCurrency] = useState('usd');
  const [activeTab, setActiveTab] = useState('table');

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch('/api/memecoin/topcoin?vs_currency=usd');
        const data = await response.json();
        setCoins(data);
        setLoading(false);

        if (data.length > 0) {
          setSelectedCoin(data[0].id);
          fetchChartData(data[0].id, selectedDays);
        }
      } catch (error) {
        console.error('Error fetching coin data:', error);
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  const fetchChartData = async (coinId: string, days: string) => {
    setChartLoading(true);
    try {
      const response = await fetch(`/api/memecoin/chart/${coinId}/${selectedCurrency}/${days}_days.json`);

      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`);
      }

      const data: ChartData = await response.json();

      const formattedData = data.stats.map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        price,
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const handleCoinSelect = (coinId: string) => {
    setSelectedCoin(coinId);
    fetchChartData(coinId, selectedDays);
    setActiveTab('chart');
  };

  const handleDaysChange = (days: string) => {
    setSelectedDays(days);
    if (selectedCoin) {
      fetchChartData(selectedCoin, days);
    }
  };

  return (
    <Animator>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ContentBox>
          <h1 style={{ fontSize: '1.5rem', color: '#00ffff', margin: 0 }}>
            Top Meme Coins
          </h1>
        </ContentBox>

        <TabsContainer>
          {['table', 'chart'].map((tab) => (
            <TabButton
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'table' ? 'Coins Table' : 'Price Chart'}
            </TabButton>
          ))}
        </TabsContainer>

        {activeTab === 'chart' && (
          <ContentBox>
              <h2 style={{ fontSize: '1rem', color: '#00ffff', marginBottom: '0.5rem' }}>
                {selectedCoin ? coins.find((c) => c.id === selectedCoin)?.name : 'Select a coin'} Price Chart
              </h2>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {['7', '30', '60', '90'].map((days) => (
                  <button
                    key={days}
                    onClick={() => handleDaysChange(days)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: selectedDays === days ? 'rgba(0, 255, 255, 0.2)' : 'transparent',
                      border: `1px solid ${selectedDays === days ? '#00ffff' : 'rgba(0, 255, 255, 0.2)'}`,
                      color: '#00ffff',
                      cursor: 'pointer',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    {days}D
                  </button>
                ))}
              </div>

              {chartLoading ? (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#00aaaa' }}>Loading chart...</p>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="rgba(0, 255, 255, 0.1)" />
                    <XAxis dataKey="date" stroke="#00ffff" style={{ fontSize: '0.75rem' }} />
                    <YAxis stroke="#00ffff" style={{ fontSize: '0.75rem' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid #00ffff',
                        borderRadius: '0.25rem',
                      }}
                      labelStyle={{ color: '#00ffff' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#00ffff"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#00aaaa' }}>No chart data available</p>
                </div>
              )}
          </ContentBox>
        )}

        {activeTab === 'table' && (
          <ContentBox style={{ overflowX: 'auto' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: '2rem',
                        background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1))',
                        backgroundSize: '200% 100%',
                        animation: 'loading 1.5s infinite',
                        borderRadius: '0.25rem',
                      }}
                    />
                  ))}
                </div>
              ) : (
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Symbol</th>
                      <th>Current Price</th>
                      <th>Market Cap</th>
                      <th>Total Volume</th>
                      <th>24h Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coins.map((coin) => (
                      <tr
                        key={coin.id}
                        onClick={() => handleCoinSelect(coin.id)}
                        style={{
                          background: selectedCoin === coin.id ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                        }}
                      >
                        <td>{coin.market_cap_rank}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img
                              src={coin.image}
                              alt={coin.name}
                              style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                            />
                            {coin.name}
                          </div>
                        </td>
                        <td>{coin.symbol.toUpperCase()}</td>
                        <td>${coin.current_price.toLocaleString()}</td>
                        <td>${coin.market_cap.toLocaleString()}</td>
                        <td>${coin.total_volume.toLocaleString()}</td>
                        <td
                          style={{
                            color: coin.price_change_percentage_24h > 0 ? '#00ff00' : '#ff0000',
                            fontWeight: 'bold',
                          }}
                        >
                          {coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              )}
          </ContentBox>
        )}
      </div>
    </Animator>
  );
}
