# testxgate

## API: /api/dex

### Request Parameters (Query String)

| Parameter      | Type     | Default   | Valid Options                                                                 |
|---------------|----------|-----------|-----------------------------------------------------------------------------------|
| chainId       | string   | None      | solana, ethereum, bsc, base, arbitrum, polygon, optimism, avalanche, blast, ton, hyperliquid, hyperevm, sui, pulsechain, abstract, sonic, polkadot, bitgert, xrpl, cronos, osmosis, worldchain, berachain, tron, hedera, soneium, aptos, unichain, icp, near, multiversx, zksync, starknet, fantom, algorand, mantle, seiv2, cardano, story, apechain, ink, dogechain, core, injective, beam, metis, shibarium, moonbeam |
| dexId         | string   | None      | Depends on the selected chainId (see [Supported DEXs by Chain](#supported-dexs-by-chain))                                              |
| trendingscore | string   | h6        | m5, h1, h6, h24                                                                   |
| tokenprofile  | boolean  | false     | true, false                                                                       |
| booster       | boolean  | false     | true, false                                                                       |
| advertising   | boolean  | false     | true, false                                                                       |

### Example Request

#### Request for all networks (default)
```
GET /api/dex?trendingscore=h6
```

#### Request for specific network

| Network           | Request URL                                                                 |
|------------------|------------------------------------------------------------------------------|
| All Networks      | `GET /api/dex?trendingscore=h6`                                             |
| Solana            | `GET /api/dex?chainId=solana&trendingscore=h6`                              |
| Ethereum          | `GET /api/dex?chainId=ethereum&trendingscore=h6`                            |
| BSC (Binance Smart Chain) | `GET /api/dex?chainId=bsc&trendingscore=h6`                               |
| Base              | `GET /api/dex?chainId=base&trendingscore=h6`                                |
| Arbitrum          | `GET /api/dex?chainId=arbitrum&trendingscore=h6`                            |
| Polygon           | `GET /api/dex?chainId=polygon&trendingscore=h6`                             |
| Optimism          | `GET /api/dex?chainId=optimism&trendingscore=h6`                            |
| Avalanche         | `GET /api/dex?chainId=avalanche&trendingscore=h6`                           |
| Blast             | `GET /api/dex?chainId=blast&trendingscore=h6`                               |
| TON               | `GET /api/dex?chainId=ton&trendingscore=h6`                                 |
| Hyperliquid       | `GET /api/dex?chainId=hyperliquid&trendingscore=h6`                         |
| Hyperevm          | `GET /api/dex?chainId=hyperevm&trendingscore=h6`                            |
| Sui               | `GET /api/dex?chainId=sui&trendingscore=h6`                                 |
| Pulsechain        | `GET /api/dex?chainId=pulsechain&trendingscore=h6`                          |
| Abstract          | `GET /api/dex?chainId=abstract&trendingscore=h6`                            |
| Sonic             | `GET /api/dex?chainId=sonic&trendingscore=h6`                               |
| Polkadot          | `GET /api/dex?chainId=polkadot&trendingscore=h6`                            |
| Bitgert           | `GET /api/dex?chainId=bitgert&trendingscore=h6`                             |
| XRPL              | `GET /api/dex?chainId=xrpl&trendingscore=h6`                                |
| Cronos            | `GET /api/dex?chainId=cronos&trendingscore=h6`                              |
| Osmosis           | `GET /api/dex?chainId=osmosis&trendingscore=h6`                             |
| Worldchain        | `GET /api/dex?chainId=worldchain&trendingscore=h6`                          |
| Berachain         | `GET /api/dex?chainId=berachain&trendingscore=h6`                           |
| Tron              | `GET /api/dex?chainId=tron&trendingscore=h6`                                |
| Hedera            | `GET /api/dex?chainId=hedera&trendingscore=h6`                              |
| Soneium           | `GET /api/dex?chainId=soneium&trendingscore=h6`                             |
| Aptos             | `GET /api/dex?chainId=aptos&trendingscore=h6`                               |
| Unichain          | `GET /api/dex?chainId=unichain&trendingscore=h6`                            |
| ICP               | `GET /api/dex?chainId=icp&trendingscore=h6`                                 |
| Near              | `GET /api/dex?chainId=near&trendingscore=h6`                                |
| Multiversx        | `GET /api/dex?chainId=multiversx&trendingscore=h6`                          |
| zkSync            | `GET /api/dex?chainId=zksync&trendingscore=h6`                              |
| Starknet          | `GET /api/dex?chainId=starknet&trendingscore=h6`                            |
| Fantom            | `GET /api/dex?chainId=fantom&trendingscore=h6`                              |
| Algorand          | `GET /api/dex?chainId=algorand&trendingscore=h6`                            |
| Mantle            | `GET /api/dex?chainId=mantle&trendingscore=h6`                              |
| Sei v2            | `GET /api/dex?chainId=seiv2&trendingscore=h6`                               |
| Cardano           | `GET /api/dex?chainId=cardano&trendingscore=h6`                             |
| Story             | `GET /api/dex?chainId=story&trendingscore=h6`                               |
| Apechain          | `GET /api/dex?chainId=apechain&trendingscore=h6`                            |
| Ink               | `GET /api/dex?chainId=ink&trendingscore=h6`                                 |
| Dogechain         | `GET /api/dex?chainId=dogechain&trendingscore=h6`                           |
| Core              | `GET /api/dex?chainId=core&trendingscore=h6`                                |
| Injective         | `GET /api/dex?chainId=injective&trendingscore=h6`                           |
| Beam              | `GET /api/dex?chainId=beam&trendingscore=h6`                                |
| Metis             | `GET /api/dex?chainId=metis&trendingscore=h6`                               |
| Shibarium         | `GET /api/dex?chainId=shibarium&trendingscore=h6`                           |
| Moonbeam          | `GET /api/dex?chainId=moonbeam&trendingscore=h6`                            |

### Response (JSON)
```json
{
  "pairs": [
    // list of token pair info (see DexScreener documentation for detailed structure)
  ]
}
```

### Error Response
```json
{
  "error": "error message"
}
```

## Supported Chains and DEXs

### Supported Chains
- Solana
- Ethereum
- BSC (Binance Smart Chain)
- Base
- Avalanche
- Polygon
- Optimism
- Arbitrum
- Fantom
- Pulsechain
- Sui
- Hyperliquid
- Hyperevm
- Cardano
- Algorand
- ZkSync
- Near
- Polkadot
- Tron
- Dogechain
- Injective
- Cosmos
- Celo
- Kava
- Harmony
- Elastos
- Meter
- Telos

### Supported DEXs by Chain

| Chain      | DEXs                                                                 |
|------------|----------------------------------------------------------------------|
| Solana     | pumpswap, raydium, meteora, orca, launchlab, pumpfun, dexlab, fluxbeam, meteoradbc, moonit, coinchef, vertigo, tokenmill, superx |
| Ethereum   | uniswap, curve, balancer, pancakeswap, solidlycom, sushiswap, fraxswap, shibaswap, ethervista, defiswap, verse, 9inch, lif3, stepn, orion, safemoonswap, radioshack, wagmi, diamondswap, empiredex, swapr, blueprint, okxdex, memebox, kyberswap, pyeswap, templedao, vulcandex |
| BSC        | pancakeswap, uniswap, thena, squadswap, unchain-x, biswap, fstswap, apeswap, bakeryswap, coinfair, tiktokfun, babyswap, dinosaureggs, sushiswap, mdex, babydogeswap, orion, nomiswap, dexswap, tidaldex, openocean, knightswap, autoshark, safemoonswap, marsecosystem, iziswap, mochiswap, planetfinance, elkfinance, w3swap, swych, jetswap, hyperjump, coneexchange, fraxswap, kyotoswap, radioshack, jswap, baryonswap, padswap, traderjoe, orbitalswap, saitaswap, sphynx, pandora, leonicorn, annexfinance, empiredex, diamondswap, pyreswap, niob, kyberswap, pyeswap, lif3, ethervista, aequinox, vertek |
| Base       | aerodrome, uniswap, pancakeswap, baseswap, alien-base, sushiswap, balancer, deltaswap, solidlycom, swapbased, dackieswap, iziswap, equalizer, rocketswap, infusion, 9mm, shark-swap, treble, diamondswap, velocimeter, synthswap, leetswap, citadelswap, basex, robots-farm, horizondex, satori, derpdex, basofinance, candy-swap, cloudbase, fwx, throne, memebox, icecreamswap, crescentswap, moonbase, kokonutswap, lfgswap, oasisswap, degenbrains, cbswap, bakeryswap, basedswap, ethervista, glacier |
| Avalanche   | pharaoh, traderjoe, arenatrade, uniswap, pangolin, aquaspace, kyberswap, vapordex, fraxswap, hurricaneswap, lydiafinance, sushiswap, radioshack, swapsicle, hakuswap, elkfinance, alligator, yetiswap, partyswap, glacier, thorus, pyreswap, fwx, diamondswap, onavax, empiredex, tokenmill |
| Polygon    | quickswap, uniswap, balancer, sushiswap, dooar, retro, apeswap, dfyn, vulcandex, fraxswap, polycat, kyberswap, jetswap, polyzap, gravityfinance, mmfinance, radioshack, dinoswap, dystopia, comethswap, nachofinance, lif3, elkfinance, jamonswap, pearl, algebra, firebird, satin, empiredex, safemoonswap, tetuswap |
| Optimism   | velodrome, uniswap, solidlycom, beethovenx, sushiswap, fraxswap, zipswap, kyberswap, openxswap, superswap, elkfinance, dackieswap |
| Arbitrum   | uniswap, pancakeswap, camelot, ramses, sushiswap, traderjoe, arbswap, zyberswap, spartadex, deltaswap, solidlycom, fraxswap, kyberswap, swapr, chronos, mmfinance, solidlizard, magicswap, elkfinance, oreoswap, arbidex, swapfish, aegis, mindgames, oasisswap, auragi, alienfi, sharkyswap, apeswap, sterling, dackieswap, 3xcalibur, arbiswap, degenbrains, spinaqdex, shekelswap, ethervista, crescentswap, dexfi |
| Fantom     | spookyswap, wigoswap, beethovenx, spiritswap, equalizer, pyreswap, velocimeter, protofi, morpheusswap, hyperjump, solidly, tombswap, sushiswap, paintswap, lif3, solidlycom, farmtom, degenhaus, redemption, knightswap, soulswap, excalibur, elkfinance, yoshiexchange, wingswap, bombswap, jetswap, skullswap, memebox, defyswap, kyberswap, wagmi, empiredex, fraxswap |
| Pulsechain | pulsex, 9mm, 9inch, pdex, uniswap, pulse-rate, sushiswap, sparkswap, dextop, eazyswap, velocimeter |
| Sui        | bluefin, cetus, turbos-finance, aftermath, flowx, bluemove |
| Hyperliquid | hyperliquid |
| Hyperevm   | hyperswap, kittenswap, hybra-finance, laminar, hypercat, manaswap, noxa, dyorswap |
| Cardano    | minswap, wingriders, sundaeswap |
| Algorand   | tinyman |
| ZkSync     | pancakeswap, syncswap, zkswap, oku, spacefi, koi, iziswap, velocore, ezkalibur, vesync, gemswap, wagmi, derpdex, draculafi, holdstation, gameswap |
| Near       | rhea-finance |
| Polkadot   | hydration |
| Tron       | sunswap |
| Dogechain  | quickswap, dogeswap, fraxswap, kibbleswap, yodeswap, dogeshrek, bourbondefi, pupswap |
| Injective  | dojoswap |
| Cosmos     | cosmoswap |
| Celo       | uniswap, velodrome, ubeswap, sushiswap |
| Kava       | wagmi, kinetix, equilibre, elkfinance, surfswap, photonswap |
| Harmony    | sushiswap, swap, tranquilfinance, defikingdoms, viperswap, openswap, lootswap, mochiswap, hermesdefi, foxswap, wagmidao, bossswap, sonicswap, elkfinance |
| Elastos    | glidefinance, elkfinance |
| Meter      | voltswap |
| Telos      | swapsicle, apeswap, elkfinance, icecreamswap, omnidex, sushiswap, zappy |
| Loopnetwork | sphynx |
| Moonriver  | solarbeam, sushiswap, huckleberry, zenlink, elkfinance, padswap |
| Manta      | quickswap, pacificswap, aperture-swap, gullnetwork, iziswap, oku, firefly, cetoswap, leetswap |
| Conflux    | swappi |
| Zkfair     | abstradex, sideswap |
| Bitgert    | icecreamswap, sphynx |
| Velas      | wagyuswap, astroswap, jungleswap |
| AvalancheDFK | defikingdoms |
| Scroll     | nuri, ambient, syncswap, oku, iziswap, sushiswap, zebra, skydrome, spacefi, kyberswap, scribe, punkswap, scrollswap, zada-finance, tokan, metavault, papyrusswap, icecreamswap, luigiswap |
| Merlinchain | merlinswap |
| Beam       | beam-swap |
| Harmony    | sushiswap, swap, tranquilfinance, defikingdoms, viperswap, openswap, lootswap, mochiswap, hermesdefi, foxswap, wagmidao, bossswap, sonicswap, elkfinance |
| Celo       | uniswap, velodrome, ubeswap, sushiswap |
| EthereumPow | lfgswap, uniswap, powswap, sushiswap, hippowswap, cakewswap, defiswap, empiredex, powsea, pyeswap, radioshack, safemoonswap, shibaswap, stepn, swapr, templedao, vulcandex |
| Fraxtal    | raexchange, velodrome, fraxswap |
| EthereumClassic | etcmc, hebeswap |
| Kava       | wagmi, kinetix, equilibre, elkfinance, surfswap, photonswap |
| OasisEmerald | gemkeeper, yuzuswap, duneswap, rimswap, lizardexchange, tulipswap |
| StepNetwork | stepdex |
| Fuse       | voltagefinance, elkfinance, sushiswap |
| Polkadot   | hydration |
| Zkfair     | abstradex, sideswap |
| Bitgert    | icecreamswap, sphynx |
| Velas      | wagyuswap, astroswap, jungleswap |

---

## Daftar Endpoint API

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api` | GET | Tes root, menampilkan pesan hello dari index.py |
| `/api/dex` | GET | Proxy untuk endpoint DEX (lihat dokumentasi DEX) |
| `/api/v1/tokens/holder/<network>/<contract_address>` | GET | Mengambil daftar holder token untuk kontrak tertentu |
| `/api/v1/tokens/traders/<network>/<contract_address>` | GET | Mengambil daftar trader token untuk kontrak tertentu |
| `/api/v1/wallet/holdings/<network>/<wallet_address>` | GET | Mengambil daftar holding token unruk wallet address tertentu |

---


## Token Holder API Endpoint

Endpoint: `/api/v1/tokens/holder/<network>/<contract_address>`

Endpoint ini digunakan untuk mengambil informasi daftar holder token pada jaringan blockchain tertentu.

### Deskripsi Endpoint
- **Path:** `/api/v1/tokens/holder/<network>/<contract_address>`
- **Method:** GET
- **Tujuan:** Mengembalikan daftar holder token pada jaringan tertentu, dengan sorting dan filter opsional.
- **Implementasi:** File `api/v1/tokens/holder.py`, menggunakan cloudscraper untuk fetch data dari https://gmgn.ai/vas/api/v1/token_holders/<network>/<contract_address>.

### Parameter
| Parameter         | Tipe     | Lokasi | Wajib | Default | Deskripsi | Nilai yang Diizinkan |
|-------------------|----------|--------|-------|---------|-----------|----------------------|
| network           | string   | path   | Ya    | -       | Jaringan blockchain | sol, eth, base, bsc, tron, blast |
| contract_address  | string   | path   | Ya    | -       | Alamat kontrak token | Alamat kontrak valid |
| limit             | integer  | query  | Tidak | 100     | Jumlah holder yang diambil (1-100) | 1-100 |
| orderby           | string   | query  | Tidak | amount_percentage | Urutan hasil | last_active_timestamp, amount_percentage, sell_volume_cur, buy_volume_cur, profit |
| direction         | string   | query  | Tidak | desc    | Arah sorting | desc |
| tag               | string   | query  | Tidak | ''      | Filter holder berdasarkan tag | smart_degen, renowned, dev, fresh_wallet, rat_trader, transfer_in, dex_bot |

**Catatan:**
- `tag` opsional. Jika valid, akan memfilter holder sesuai tag.
- Parameter tidak valid akan mengembalikan 400 Bad Request.

### Response
```json
{
  "made by": "Xdeployments",
  "message": "ok",
  "dataholder": {
    "holderlist": [
      {
        "address": "string",
        "account_address": "string",
        "addr_type": 0,
        "amount_cur": number,
        ...
      }
    ]
  }
}
```


### Contoh Penggunaan
Request:
```
curl "https://your-vercel-app.vercel.app/api/v1/tokens/holder/sol/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr?limit=20&orderby=amount_percentage&direction=desc&tag=transfer_in"
```

Response: (struktur sesuai contoh di atas)

### Catatan Implementasi
- File: `api/v1/tokens/holder.py`
- Dependencies: cloudscraper, json, time
- Retry: 3x retry dengan delay 5 detik jika 403
- Error Handling: Validasi parameter & error network
- Data Processing: avatar dihapus, field next (pagination) tidak dikembalikan



## Token Traders API Endpoint

Endpoint: `/api/v1/tokens/traders/<network>/<contract_address>`

Endpoint ini digunakan untuk mengambil informasi daftar trader token pada jaringan blockchain tertentu. Mirip dengan endpoint holder, namun fokus pada data trader (misal: volume beli/jual, profit, dll).

### Deskripsi Endpoint
- **Path:** `/api/v1/tokens/traders/<network>/<contract_address>`
- **Method:** GET
- **Tujuan:** Mengembalikan daftar trader token pada jaringan tertentu, bisa diurutkan dan difilter berdasarkan tag.
- **Implementasi:** File `api/v1/tokens/traders.py`, menggunakan cloudscraper untuk fetch data dari https://gmgn.ai/vas/api/v1/token_traders/<network>/<contract_address>.

### Parameter
| Parameter         | Tipe     | Lokasi | Wajib | Default | Deskripsi | Nilai yang Diizinkan |
|-------------------|----------|--------|-------|---------|-----------|----------------------|
| network           | string   | path   | Ya    | -       | Jaringan blockchain | sol, eth, base, bsc, tron, blast |
| contract_address  | string   | path   | Ya    | -       | Alamat kontrak token | Alamat kontrak valid |
| limit             | integer  | query  | Tidak | 100     | Jumlah trader yang diambil (1-100) | 1-100 |
| orderby           | string   | query  | Tidak | buy_volume_cur | Urutan hasil | buy_volume_cur, sell_volume_cur, profit, realized_profit, unrealized_profit |
| direction         | string   | query  | Tidak | desc    | Arah sorting | desc |
| tag               | string   | query  | Tidak | ''      | Filter trader berdasarkan tag | smart_degen, renowned, dev, fresh_wallet, rat_trader, transfer_in, dex_bot |

**Catatan:**
- `tag` opsional. Jika valid, akan memfilter trader sesuai tag.
- Parameter tidak valid akan mengembalikan 400 Bad Request.

### Response
```json
{
  "made by": "Xdeployments",
  "message": "ok",
  "datatrader": {
    "traderlist": [
      {
        "address": "string",
        "account_address": "string",
        "buy_volume_cur": number,
        "sell_volume_cur": number,
        "profit": number,
        ...
      }
    ]
  }
}
```

### Contoh Penggunaan
Request:
```
curl "https://your-vercel-app.vercel.app/api/v1/tokens/traders/sol/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr?limit=20&orderby=buy_volume_cur&direction=desc&tag=transfer_in"
```

Response: (struktur sesuai contoh di atas)

### Catatan Implementasi
- File: `api/v1/tokens/traders.py`
- Dependencies: cloudscraper, json, time
- Retry: 10x retry (tanpa delay) jika gagal request
- Error Handling: Validasi parameter & error network
- Data Processing: avatar dihapus, field next (pagination) tidak dikembalikan


# Wallet Holdings API Documentation

This section documents the `/api/v1/wallet/holdings` endpoint of the Xdeployments API, which retrieves wallet holdings data for a specified wallet address on a supported blockchain network.

## /api/v1/wallet/holdings

- **Endpoint**: `/api/v1/wallet/holdings/<network>/<wallet_address>`
- **Method**: GET
- **Description**: Retrieves wallet holdings data for a given wallet address on a specified blockchain network from the gmgn.ai API. The response includes all token holdings details, including the `next` pagination token, without removing any fields from the original API response.

### Parameters

| Parameter       | Type   | Required | Default                 | Description                                                                 | Valid Values                                                                 |
|-----------------|--------|----------|-------------------------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------|
| `network`       | String | Yes      | -                       | Blockchain network.                                                         | `sol`, `eth`, `base`, `bsc`, `tron`, `blast`                                 |
| `wallet_address`| String | Yes      | -                       | Wallet address to query holdings for.                                       | Valid wallet address (validated by gmgn.ai API)                              |
| `limit`         | Integer| No       | `50`                    | Number of holdings to return (1-50).                                        | `1` to `50`                                                                 |
| `orderby`       | String | No       | `last_active_timestamp` | Field to sort results by.                                                  | `last_active_timestamp`, `unrealized_profit`, `realized_profit`, `total_profit`, `usd_value`, `history_bought_cost`, `history_sold_income` |
| `direction`     | String | No       | `desc`                  | Sort direction.                                                            | `asc`, `desc`                                                               |
| `showsmall`     | String | No       | `false`                 | Hide small assets (`true` to disable, `false` to enable).                   | `true`, `false`                                                             |
| `sellout`       | String | No       | `false`                 | Hide sell-out assets (`true` to disable, `false` to enable).                | `true`, `false`                                                             |
| `hide_abnormal` | String | No       | `false`                 | Hide low liquidity/honeypot tokens (`true` to enable, `false` to disable).  | `true`, `false`                                                             |

### Response

**Response Format**:
```json
{
  "made by": "Xdeployments",
  "message": "ok",
  "datawallet": {
    "holdingslist": [
      {
        "token": {
          "address": "string",
          "token_address": "string",
          "symbol": "string",
          "name": "string",
          "decimals": number,
          "logo": "string",
          "price_change_6h": "string",
          "is_show_alert": boolean,
          "is_honeypot": null
        },
        "balance": "string",
        "usd_value": "string",
        "realized_profit_30d": "string",
        "realized_profit": "string",
        "realized_pnl": "string",
        "realized_pnl_30d": "string",
        "unrealized_profit": "string",
        "unrealized_pnl": "string",
        "total_profit": "string",
        "total_profit_pnl": "string",
        "avg_cost": "string",
        "avg_sold": "string",
        "buy_30d": number,
        "sell_30d": number,
        "sells": number,
        "price": "string",
        "cost": "string",
        "position_percent": "string",
        "last_active_timestamp": number,
        "history_sold_income": "string",
        "history_bought_cost": "string",
        "start_holding_at": number,
        "end_holding_at": null,
        "liquidity": "string",
        "total_supply": "string",
        "wallet_token_tags": ["string"] | null,
        "last_block": number
      },
      ...
    ],
    "next": "string"
  }
}
```

**Error Response**:
```json
{
  "error": "string",
  "message": "string" // Optional
}
```

### Example Usage

**Request**:
```bash
curl "https://your-vercel-app.vercel.app/api/v1/wallet/holdings/sol/ApRnQN2HkbCn7W2WWiT2FEKvuKJp9LugRyAE1a9Hdz1?limit=50&orderby=last_active_timestamp&direction=desc&showsmall=true&sellout=true&hide_abnormal=false"
```

**Response**:
```json
{
  "made by": "Xdeployments",
  "message": "ok",
  "datawallet": {
    "holdingslist": [
      {
        "token": {
          "address": "CjrjfG7UH8pfeTkDsXL7JHtfoBpqEUWm7wtTtusopump",
          "token_address": "CjrjfG7UH8pfeTkDsXL7JHtfoBpqEUWm7wtTtusopump",
          "symbol": "Lomen",
          "name": "Lomen AI",
          "decimals": 6,
          "logo": "https://gmgn.ai/external-res/2433f1fa8b5314cdacc7695cedb2fc6f.webp",
          "price_change_6h": "0.2717753426693182",
          "is_show_alert": false,
          "is_honeypot": null
        },
        "balance": "1800000",
        "usd_value": "51.2057142",
        "realized_profit_30d": "0",
        "realized_profit": "0",
        "realized_pnl": "0",
        "realized_pnl_30d": "0",
        "unrealized_profit": "0",
        "unrealized_pnl": "0",
        "total_profit": "0",
        "total_profit_pnl": "0",
        "avg_cost": "0",
        "avg_sold": "0",
        "buy_30d": 0,
        "sell_30d": 0,
        "sells": 0,
        "price": "0.000028447619",
        "cost": "0",
        "position_percent": "1",
        "last_active_timestamp": 1749266686,
        "history_sold_income": "0",
        "history_bought_cost": "0",
        "start_holding_at": 1749266688,
        "end_holding_at": null,
        "liquidity": "50252.27594155072",
        "total_supply": "1000000000",
        "wallet_token_tags": null,
        "last_block": 345137800
      },
      ...
    ],
    "next": "MTc0OTA1NjA4Ml82SHNNeHhORGVlMVdzUnpvbk50RUV1MzVMdGk0Q1hleTh3enVlWTdycHVtcA=="
  }
}
```
### Notes
- The `next` field in the response can be used for pagination to fetch the next set of holdings.
- The `showsmall`, `sellout`, and `hide_abnormal` filters control the visibility of assets:
  - `showsmall=true`: Disables hiding of small assets.
  - `sellout=true`: Disables hiding of sell-out assets.
  - `hide_abnormal=true`: Enables hiding of low liquidity or honeypot tokens.
- Ensure the `wallet_address` is valid for the specified network to avoid errors from the gmgn.ai API.
- The endpoint is deployed on Vercel and uses Python serverless functions with Flask and cloudscraper for API requests.


# Wallet Flow API Documentation

This section documents the `/api/v1/wallet/flow` endpoint of the Xdeployments API, which retrieves wallet transaction flow data for a specified wallet address on a supported blockchain network.

## /api/v1/wallet/flow

- **Endpoint**: `/api/v1/wallet/flow/<network>/<wallet_address>`
- **Method**: GET
- **Description**: Retrieves wallet transaction flow data for a given wallet address on a specified blockchain network from the gmgn.ai API. The -response includes all token flow details, including the `next` pagination token, without removing any fields from the original API response. The parameters `showsmall`, `sellout`, and `tx30d` are fixed as `true`, limiting the request to transactions within the last 30 days, including small assets and sell-out assets.

### Parameters

| Parameter       | Type   | Required | Default                 | Description                                                                 | Valid Values                                                                 |
|-----------------|--------|----------|-------------------------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------|
| `network`       | String | Yes      | -                       | Blockchain network.                                                         | `sol`, `eth`, `base`, `bsc`, `tron`, `blast`                                 |
| `wallet_address`| String | Yes      | -                       | Wallet address to query transaction flows for.                              | Valid wallet address (validated by gmgn.ai API)                              |
| `limit`         | Integer| No       | `50`                    | Number of flows to return (1-50).                                           | `1` to `50`                                                                 |
| `orderby`       | String | No       | `last_active_timestamp` | Field to sort results by.                                                  | `last_active_timestamp`, `unrealized_profit`, `realized_profit`, `total_profit`, `usd_value`, `history_bought_cost`, `history_sold_income` |
| `direction`     | String | No       | `desc`                  | Sort direction.                                                            | `asc`, `desc`                                                               |

### Response

**Response Format**:
```json
{
  "made by": "Xdeployments",
  "message": "ok",
  "datawallet": {
    "flowlist": [
      {
        "token": {
          "address": "string",
          "token_address": "string",
          "symbol": "string",
          "name": "string",
          "decimals": number,
          "logo": "string",
          "price_change_6h": "string",
          "is_show_alert": boolean,
          "is_honeypot": null
        },
        "balance": "string",
        "usd_value": "string",
        "realized_profit_30d": "string",
        "realized_profit": "string",
        "realized_pnl": "string",
        "realized_pnl_30d": "string",
        "unrealized_profit": "string",
        "unrealized_pnl": "string",
        "total_profit": "string",
        "total_profit_pnl": "string",
        "avg_cost": "string",
        "avg_sold": "string",
        "buy_30d": number,
        "sell_30d": number,
        "sells": number,
        "price": "string",
        "cost": "string",
        "position_percent": "string",
        "last_active_timestamp": number,
        "history_sold_income": "string",
        "history_bought_cost": "string",
        "start_holding_at": number,
        "end_holding_at": null,
        "liquidity": "string",
        "total_supply": "string",
        "wallet_token_tags": ["string"] | null,
        "last_block": number
      },
      ...
    ],
    "next": "string"
  }
}
```

**Error Response**:
```json
{
  "error": "string",
  "message": "string" // Optional
}
```

### Example Usage

**Request**:
```bash
curl "https://your-vercel-app.vercel.app/api/v1/wallet/flow/sol/ApRnQN2HkbCn7W2WWiT2FEKvuKJp9LugRyAE1a9Hdz1?limit=50&orderby=last_active_timestamp&direction=desc"
```

**Response**:
```json
{
  "made by": "Xdeployments",
  "message": "ok",
  "datawallet": {
    "flowlist": [
      {
        "token": {
          "address": "CjrjfG7UH8pfeTkDsXL7JHtfoBpqEUWm7wtTtusopump",
          "token_address": "CjrjfG7UH8pfeTkDsXL7JHtfoBpqEUWm7wtTtusopump",
          "symbol": "Lomen",
          "name": "Lomen AI",
          "decimals": 6,
          "logo": "https://gmgn.ai/external-res/2433f1fa8b5314cdacc7695cedb2fc6f.webp",
          "price_change_6h": "0.2717753426693182",
          "is_show_alert": false,
          "is_honeypot": null
        },
        "balance": "1800000",
        "usd_value": "51.2057142",
        "realized_profit_30d": "0",
        "realized_profit": "0",
        "realized_pnl": "0",
        "realized_pnl_30d": "0",
        "unrealized_profit": "0",
        "unrealized_pnl": "0",
        "total_profit": "0",
        "total_profit_pnl": "0",
        "avg_cost": "0",
        "avg_sold": "0",
        "buy_30d": 0,
        "sell_30d": 0,
        "sells": 0,
        "price": "0.000028447619",
        "cost": "0",
        "position_percent": "1",
        "last_active_timestamp": 1749266686,
        "history_sold_income": "0",
        "history_bought_cost": "0",
        "start_holding_at": 1749266688,
        "end_holding_at": null,
        "liquidity": "50252.27594155072",
        "total_supply": "1000000000",
        "wallet_token_tags": null,
        "last_block": 345137800
      },
      ...
    ],
    "next": "MTc0OTA1NjA4Ml82SHNNeHhORGVlMVdzUnpvbk50RUV1MzVMdGk0Q1hleTh3enVlWTdycHVtcA=="
  }
}
```

### Notes
- The `next` field in the response can be used for pagination to fetch the next set of transaction flows.
- The parameters `showsmall=true`, `sellout=true`, and `tx30d=true` are fixed, ensuring the response includes small assets, sell-out assets, and transactions within the last 30 days.
- Ensure the `wallet_address` is valid for the specified network to avoid errors from the gmgn.ai API.
- The endpoint uses the `wallet_holdings` API from gmgn.ai, which may return data similar to the `/api/v1/wallet/holdings` endpoint. This endpoint is deployed on Vercel and uses Python serverless functions with Flask and cloudscraper for API requests.
- The retry mechanism attempts up to 10 times with no delay for HTTP 403 errors, which may lead to rate-limiting. Consider adjusting to fewer retries (e.g., 3) with a delay (e.g., 5 seconds) for better reliability.



# Wallet Activity API Documentation

This section documents the `/api/v1/wallet/activity` endpoint of the Xdeployments API, which retrieves wallet activity data (e.g., buy, sell, transfer transactions) for a specified wallet address on a supported blockchain network.

## /api/v1/wallet/activity

- **Endpoint**: `/api/v1/wallet/activity/<network>/<wallet_address>`
- **Method**: GET
- **Description**: Retrieves wallet activity data, such as buy, sell, transfer-in, transfer-out, add, and remove transactions, for a given wallet address on a specified blockchain network from the gmgn.ai API. The response includes all activity details, including the `next` pagination token, without removing any fields from the original API response. The parameters `type` (set to `buy`, `sell`, `transferIn`, `transferOut`, `add`, `remove`), `app_lang` (set to `en-US`), `os` (set to `web`), and `cost` (set to `10`) are fixed in the API request.

### Parameters

| Parameter       | Type   | Required | Default | Description                                                                 | Valid Values                                                                 |
|-----------------|--------|----------|---------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------|
| `network`       | String | Yes      | -       | Blockchain network.                                                         | `sol`, `eth`, `base`, `bsc`, `tron`, `blast`                                 |
| `wallet_address`| String | Yes      | -       | Wallet address to query activities for.                                     | Valid wallet address (validated by gmgn.ai API)                              |
| `limit`         | Integer| No       | `50`    | Number of activities to return (1-200).                                     | `1` to `200`                                                                |

### Response

**Response Format**:
```json
{
  "made by": "Xdeployments",
  "message": "ok",
  "datawallet": {
    "activitylist": [
      {
        "wallet": "string",
        "chain": "string",
        "tx_hash": "string",
        "timestamp": number,
        "event_type": "string",
        "token": {
          "address": "string",
          "symbol": "string",
          "logo": "string",
          "total_supply": "string"
        },
        "token_amount": "string",
        "quote_amount": "string",
        "cost_usd": "string",
        "buy_cost_usd": "string",
        "price_usd": "string",
        "is_open_or_close": number,
        "quote_token": {
          "token_address": "string",
          "name": "string",
          "symbol": "string",
          "decimals": number,
          "logo": "string"
        },
        "from_address": "string",
        "to_address": "string"
      },
      ...
    ],
    "next": "string"
  }
}
```

**Error Response**:
```json
{
  "error": "string",
  "message": "string" // Optional
}
```

### Example Usage

**Request**:
```bash
curl "/api/v1/wallet/activity/sol/BqEjKBem4gcyPPPn7ipKdSbXegrGvENSaHHEnRp3f4QW?limit=5"
```

**Response**:
```json
{
  "made by": "Xdeployments",
  "message": "ok",
  "datawallet": {
    "activitylist": [
      {
        "wallet": "",
        "chain": "sol",
        "tx_hash": "5KHDqWyR34jFNuF3Dw3Wf32LhSHRWBmAAJYb6BXfZ6gC4d7cdsS1Z3MkD2ZbRzysjjnyFUHCTQmAHUukSFuG1r8a",
        "timestamp": 1747797095,
        "event_type": "sell",
        "token": {
          "address": "BmXfbamFqrBzrqihr9hbSmEsfQUXMVaqshAjgvZupump",
          "symbol": "LUX",
          "logo": "https://gmgn.ai/external-res/be4542f7dd732007a33bf8b4abe6b100.webp",
          "total_supply": "994961799"
        },
        "token_amount": "538002.61837200000000000000",
        "quote_amount": "15.15376205600000000000",
        "cost_usd": "2565.98652894248",
        "buy_cost_usd": "2654.38222435291759128492",
        "price_usd": "0.004769468477141844",
        "is_open_or_close": 1,
        "quote_token": {
          "token_address": "So11111111111111111111111111111111111111112",
          "name": "Wrapped SOL",
          "symbol": "WSOL",
          "decimals": 9,
          "logo": "https://gmgn.ai/external-res/57f0f988ba8fe74f5893ff64498ea05e.webp"
        },
        "from_address": "",
        "to_address": ""
      }
    ],
    "next": "MDAzNDE0MDM0MjQ2NzM5ODAwMQ=="
  }
}
```

### Notes
- The `next` field in the response can be used for pagination to fetch the next set of wallet activities.
- The parameters `type=['buy', 'sell', 'transferIn', 'transferOut', 'add', 'remove']`, `app_lang=en-US`, `os=web`, and `cost=10` are fixed, ensuring the response includes all specified transaction types.
- Ensure the `wallet_address` is valid for the specified network to avoid errors from the gmgn.ai API.
- The endpoint is deployed on Vercel and uses Python serverless functions with Flask and cloudscraper for API requests.
- The retry mechanism attempts up to 3 times with a 5-second delay for HTTP 403 errors to handle Cloudflare restrictions. Consider aligning retry settings across other endpoints (e.g., `holdings.py`, `flow.py`) for consistency.


# Wallet Statistics API Documentation

This section documents the `/api/v1/wallet/statistics` endpoint of the Xdeployments API, which retrieves statistical data for a specified wallet address on a supported blockchain network.

## /api/v1/wallet/statistics

- **Endpoint**: `/api/v1/wallet/statistics/<network>/<wallet_address>`
- **Method**: GET
- **Description**: Retrieves wallet statistics, such as buy/sell transaction counts, realized and unrealized profits, win rate, and other metrics, for a given wallet address on a specified blockchain network from the gmgn.ai API. The response includes all fields from the gmgn.ai API, including the `avatar` field, without any removals. The parameters `app_lang` (set to `en-US`) and `os` (set to `web`) are fixed in the API request. The `period` parameter allows filtering statistics by time period (`1d`, `7d`, `30d`, or `all`).

### Parameters

| Parameter       | Type   | Required | Default | Description                                                                 | Valid Values                                                                 |
|-----------------|--------|----------|---------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------|
| `network`       | String | Yes      | -       | Blockchain network.                                                         | `sol`, `eth`, `base`, `bsc`, `tron`, `blast`                                 |
| `wallet_address`| String | Yes      | -       | Wallet address to query statistics for.                                     | Valid wallet address (validated by gmgn.ai API)                              |
| `period`        | String | No       | `1d`    | Time period for statistics.                                                 | `1d`, `7d`, `30d`, `all`                                                    |

### Response

**Response Format**:
```json
{
  "made by": "Xdeployments",
  "message": "ok",
  "datawallet": {
    "statistics": {
      "buy": 26,
      "buy_1d": 26,
      "buy_7d": 170,
      "buy_30d": 945,
      "sell": 26,
      "sell_1d": 26,
      "sell_7d": 136,
      "sell_30d": 872,
      "pnl": -0.0108317323363504,
      "pnl_1d": -0.0108317323363504,
      "pnl_7d": -0.121926533254259,
      "pnl_30d": -0.0357259581933257,
      "all_pnl": 0.126093906675944,
      "realized_profit": 1306176.03109082,
      "realized_profit_1d": -262.634109676818,
      "realized_profit_7d": -33728.1556923528,
      "realized_profit_30d": -59945.1289226416,
      "unrealized_profit": 170054.994905406,
      "unrealized_pnl": 0.0158192672270661,
      "total_profit": 1476231.02599623,
      "total_profit_pnl": 0.136030211483254,
      "balance": "19.50234457",
      "eth_balance": "19.50234457",
      "sol_balance": "19.50234457",
      "trx_balance": "19.50234457",
      "bnb_balance": "19.50234457",
      "total_value": 819152.681362827,
      "winrate": 0.411764705882353,
      "token_sold_avg_profit": -14.5907838709344,
      "history_bought_cost": 27038.536847447,
      "token_avg_cost": 1502.14093596928,
      "token_num": 18,
      "profit_num": 7,
      "pnl_lt_minus_dot5_num": 5,
      "pnl_minus_dot5_0x_num": 5,
      "pnl_lt_2x_num": 6,
      "pnl_2x_5x_num": 2,
      "pnl_gt_5x_num": 0,
      "gas_cost": 0,
      "bind": false,
      "avatar": "https://pbs.twimg.com/profile_images/1907294815081078784/KfZfapna_400x400.jpg",
      "name": "s",
      "ens": "",
      "tags": [
        "kol",
        "axiom",
        "photon"
      ],
      "tag_rank": {
        "axiom": 0,
        "kol": 705,
        "photon": 0
      },
      "twitter_name": "s",
      "twitter_username": "runitbackghost",
      "twitter_bind": false,
      "twitter_fans_num": 17283,
      "followers_count": 17283,
      "is_contract": false,
      "last_active_timestamp": 1749526407,
      "risk": {
        "token_active": 16,
        "token_honeypot": 0,
        "token_honeypot_ratio": 0,
        "no_buy_hold": 0,
        "no_buy_hold_ratio": 0,
        "sell_pass_buy": 0,
        "sell_pass_buy_ratio": 0,
        "fast_tx": 0,
        "fast_tx_ratio": 0
      },
      "avg_holding_peroid": 8135.25,
      "updated_at": 1749526407,
      "refresh_requested_at": null,
      "follow_count": 5889,
      "remark_count": 4762
    }
  }
}
```

**Error Response**:
```json
{
  "error": "string",
  "message": "string" // Optional
}
```

### Example Usage

**Request**:
```bash
curl "/api/v1/wallet/statistics/sol/ApRnQN2HkbCn7W2WWiT2FEKvuKJp9LugRyAE1a9Hdz1?period=1d"
```

**Response**:
```json
{
  "made by": "Xdeployments",
  "message": "ok",
  "datawallet": {
    "statistics": {
      "buy": 26,
      "buy_1d": 26,
      "buy_7d": 170,
      "buy_30d": 945,
      "sell": 26,
      "sell_1d": 26,
      "sell_7d": 136,
      "sell_30d": 872,
      "pnl": -0.0108317323363504,
      "pnl_1d": -0.0108317323363504,
      "pnl_7d": -0.121926533254259,
      "pnl_30d": -0.0357259581933257,
      "all_pnl": 0.126093906675944,
      "realized_profit": 1306176.03109082,
      "realized_profit_1d": -262.634109676818,
      "realized_profit_7d": -33728.1556923528,
      "realized_profit_30d": -59945.1289226416,
      "unrealized_profit": 170054.994905406,
      "unrealized_pnl": 0.0158192672270661,
      "total_profit": 1476231.02599623,
      "total_profit_pnl": 0.136030211483254,
      "balance": "19.50234457",
      "eth_balance": "19.50234457",
      "sol_balance": "19.50234457",
      "trx_balance": "19.50234457",
      "bnb_balance": "19.50234457",
      "total_value": 819152.681362827,
      "winrate": 0.411764705882353,
      "token_sold_avg_profit": -14.5907838709344,
      "history_bought_cost": 27038.536847447,
      "token_avg_cost": 1502.14093596928,
      "token_num": 18,
      "profit_num": 7,
      "pnl_lt_minus_dot5_num": 5,
      "pnl_minus_dot5_0x_num": 5,
      "pnl_lt_2x_num": 6,
      "pnl_2x_5x_num": 2,
      "pnl_gt_5x_num": 0,
      "gas_cost": 0,
      "bind": false,
      "avatar": "https://pbs.twimg.com/profile_images/1907294815081078784/KfZfapna_400x400.jpg",
      "name": "s",
      "ens": "",
      "tags": ["kol", "axiom", "photon"],
      "tag_rank": {"axiom": 0, "kol": 705, "photon": 0},
      "twitter_name": "s",
      "twitter_username": "runitbackghost",
      "twitter_bind": false,
      "twitter_fans_num": 17283,
      "followers_count": 17283,
      "is_contract": false,
      "last_active_timestamp": 1749526407,
      "risk": {
        "token_active": 16,
        "token_honeypot": 0,
        "token_honeypot_ratio": 0,
        "no_buy_hold": 0,
        "no_buy_hold_ratio": 0,
        "sell_pass_buy": 0,
        "sell_pass_buy_ratio": 0,
        "fast_tx": 0,
        "fast_tx_ratio": 0
      },
      "avg_holding_peroid": 8135.25,
      "updated_at": 1749526407,
      "refresh_requested_at": null,
      "follow_count": 5889,
      "remark_count": 4762
    }
  }
}
```

### Notes
- The `period` parameter filters statistics by time period (`1d`, `7d`, `30d`, or `all`), with `1d` as the default.
- Ensure the `wallet_address` is valid for the specified network to avoid errors from the gmgn.ai API.
- The endpoint is deployed on Vercel and uses Python serverless functions with Flask and cloudscraper for API requests.
- The retry mechanism attempts up to 3 times with a 5-second delay for HTTP 403 errors to handle Cloudflare restrictions. Consider aligning retry settings across other endpoints (e.g., `holdings.py`, `flow.py`, `holder.py`) to use `max_retries = 3` and `retry_delay = 5` for consistency.
- All fields from the gmgn.ai API, including `avatar`, are included in the response, unlike some other endpoints that may exclude certain fields (e.g., `avatar` in `holder.py`).

---

**Status Codes**:
- `200 OK`: Request successful, returns wallet holdings data.
- `400 Bad Request`: Invalid parameters (e.g., unsupported network, invalid limit).
- `500 Internal Server Error`: Error processing the request (e.g., JSON parsing error).
- `503 Service Unavailable`: Server overload or failed after retries (e.g., gmgn.ai API returns 403).

---