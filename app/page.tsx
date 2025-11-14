'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Animator, FrameLines, Text } from '@arwes/react';
import styled from '@emotion/styled';

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

const MainContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background: #000;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.5) 0%, rgba(0, 10, 20, 0.5) 100%);
  border-left: 1px solid rgba(0, 255, 255, 0.1);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  gap: 1rem;
`;

const TableContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-x: auto;
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

    &:hover {
      background: rgba(0, 255, 255, 0.05);
      border-left: 2px solid #00ffff;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
`;

const LoadingBar = styled.div`
  height: 2rem;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1));
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 0.25rem;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export default function Page() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=50&page=1&sparkline=false'
        );
        const data = await response.json();
        setCoins(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching coin data:', error);
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  return (
    <Animator>
      <MainContainer>
        <AppSidebar />
        <ContentArea>
          <Header>
            <Text as="h1" animator style={{ fontSize: '1.5rem', color: '#00ffff', margin: 0 }}>
              Top Meme Coins
            </Text>
          </Header>

          <TableContainer>
            {loading ? (
              <LoadingContainer>
                {Array.from({ length: 10 }).map((_, i) => (
                  <LoadingBar key={i} />
                ))}
              </LoadingContainer>
            ) : (
              <FrameLines as="div" animator padding={1}>
                <StyledTable>
                  <thead>
                    <tr>
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
                      <tr key={coin.id}>
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
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </FrameLines>
            )}
          </TableContainer>
        </ContentArea>
      </MainContainer>
    </Animator>
  );
}