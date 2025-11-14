# api/v1/dex/dex.py

import json
import re
import base64
import os
import asyncio
import websockets

# Daftar validasi
ALLOWED_CHAINS = {
    'solana': ['pumpswap', 'raydium', 'meteora', 'orca', 'launchlab', 'pumpfun', 'dexlab', 'fluxbeam', 'meteoradbc', 'moonit', 'coinchef', 'vertigo', 'tokenmill', 'superx'],
    'ethereum': ['uniswap', 'curve', 'balancer', 'pancakeswap', 'solidlycom', 'sushiswap', 'fraxswap', 'shibaswap', 'ethervista', 'defiswap', 'verse', '9inch', 'lif3', 'stepn', 'orion', 'safemoonswap', 'radioshack', 'wagmi', 'diamondswap', 'empiredex', 'swapr', 'blueprint', 'okxdex', 'memebox', 'kyberswap', 'pyeswap', 'templedao', 'vulcandex'],
    'base': ['aerodrome', 'uniswap', 'pancakeswap', 'baseswap', 'alien-base', 'sushiswap', 'balancer', 'deltaswap', 'solidlycom', 'swapbased', 'dackieswap', 'iziswap', 'equalizer', 'rocketswap', 'infusion', '9mm', 'shark-swap', 'treble', 'diamondswap', 'velocimeter', 'synthswap', 'leetswap', 'citadelswap', 'basex', 'robots-farm', 'horizondex', 'satori', 'derpdex', 'basofinance', 'candy-swap', 'cloudbase', 'fwx', 'throne', 'memebox', 'icecreamswap', 'crescentswap', 'moonbase', 'kokonutswap', 'lfgswap', 'oasisswap', 'degenbrains', 'cbswap', 'bakeryswap', 'basedswap', 'ethervista', 'glacier'],
    'bsc': ['pancakeswap', 'uniswap', 'thena', 'squadswap', 'unchain-x', 'biswap', 'fstswap', 'apeswap', 'bakeryswap', 'coinfair', 'tiktokfun', 'babyswap', 'dinosaureggs', 'sushiswap', 'mdex', 'babydogeswap', 'orion', 'nomiswap', 'dexswap', 'tidaldex', 'openocean', 'knightswap', 'autoshark', 'safemoonswap', 'marsecosystem', 'iziswap', 'mochiswap', 'planetfinance', 'elkfinance', 'w3swap', 'swych', 'jetswap', 'hyperjump', 'coneexchange', 'fraxswap', 'kyotoswap', 'radioshack', 'jswap', 'baryonswap', 'padswap', 'traderjoe', 'orbitalswap', 'saitaswap', 'sphynx', 'pandora', 'leonicorn', 'annexfinance', 'empiredex', 'diamondswap', 'pyreswap', 'niob', 'kyberswap', 'pyeswap', 'lif3', 'ethervista', 'aequinox', 'vertek'],
    'pulsechain': ['pulsex', '9mm', '9inch', 'pdex', 'uniswap', 'pulse-rate', 'sushiswap', 'sparkswap', 'dextop', 'eazyswap', 'velocimeter'],
    'avalanche': ['pharaoh', 'traderjoe', 'arenatrade', 'uniswap', 'pangolin', 'aquaspace', 'kyberswap', 'vapordex', 'fraxswap', 'hurricaneswap', 'lydiafinance', 'sushiswap', 'radioshack', 'swapsicle', 'hakuswap', 'elkfinance', 'alligator', 'yetiswap', 'partyswap', 'glacier', 'thorus', 'pyreswap', 'fwx', 'diamondswap', 'onavax', 'empiredex', 'tokenmill'],
    'polygon': ['quickswap', 'uniswap', 'balancer', 'sushiswap', 'dooar', 'retro', 'apeswap', 'dfyn', 'vulcandex', 'fraxswap', 'polycat', 'kyberswap', 'jetswap', 'polyzap', 'gravityfinance', 'mmfinance', 'radioshack', 'dinoswap', 'dystopia', 'comethswap', 'nachofinance', 'lif3', 'elkfinance', 'jamonswap', 'pearl', 'algebra', 'firebird', 'satin', 'empiredex', 'safemoonswap', 'tetuswap'],
    'abstract': ['abstractswap', 'noxa'],
    'ton': ['stonfi', 'dedust'],
    'hyperevm': ['hyperswap', 'kittenswap', 'hybra-finance', 'laminar', 'hypercat', 'manaswap', 'noxa', 'dyorswap'],
    'sui': ['bluefin', 'cetus', 'turbos-finance', 'aftermath', 'flowx', 'bluemove'],
    'xrpl': ['xrpl'],
    'sonic': ['shadow-exchange', 'swapx', 'spookyswap', 'beets', 'metropolis', 'wagmi', 'equalizer', 'solidlycom', 'silverswap', 'atlantis', 'defive', 'sushiswap', 'zkswap', 'mobiusdex', 'sonicxswap', 'sonic-market', 'memebox', 'dyorswap', 'sonic-swap'],
    'arbitrum': ['uniswap', 'pancakeswap', 'camelot', 'ramses', 'sushiswap', 'traderjoe', 'arbswap', 'zyberswap', 'spartadex', 'deltaswap', 'solidlycom', 'fraxswap', 'kyberswap', 'swapr', 'chronos', 'mmfinance', 'solidlizard', 'magicswap', 'elkfinance', 'oreoswap', 'arbidex', 'swapfish', 'aegis', 'mindgames', 'oasisswap', 'auragi', 'alienfi', 'sharkyswap', 'apeswap', 'sterling', 'dackieswap', '3xcalibur', 'arbiswap', 'degenbrains', 'spinaqdex', 'shekelswap', 'ethervista', 'crescentswap', 'dexfi'],
    'hyperliquid': ['hyperliquid'],
    'worldchain': ['uniswap', 'worldswap', 'dyorswap', 'realswap', 'multex'],
    'osmosis': ['osmosis'],
    'ink': ['velodrome', 'inkyswap', 'dyorswap', 'squidswap'],
    'cronos': ['vvsfinance', 'mmfinance', 'ebisus-bay', 'cougar', 'cronaswap', 'obsidian-finance', 'candycity', 'crodex', 'duckydefi', 'photonswap', 'cyborgswap', 'empiredex', 'annexfinance', 'smolswap', 'croswap', 'swapp', 'kryptodex', 'agilefinance', 'elkfinance', 'degenbrains', 'cronical', 'hopswap', 'stabil'],
    'hedera': ['saucerswap'],
    'berachain': ['kodiak', 'bulla', 'beraswap', 'burrbear', 'holdstation', 'dyorswap', 'memeswap', 'memetree'],
    'aptos': ['thala', 'cellana', 'liquidswap', 'pancakeswap', 'aux', 'animeswap'],
    'tron': ['sunswap'],
    'seiv2': ['dragonswap', 'yaka-finance', 'seiport'],
    'optimism': ['velodrome', 'uniswap', 'solidlycom', 'beethovenx', 'sushiswap', 'fraxswap', 'zipswap', 'kyberswap', 'openxswap', 'superswap', 'elkfinance', 'dackieswap'],
    'linea': ['lynex', 'nile', 'pancakeswap', 'syncswap', 'oku', 'iziswap', 'sushiswap', 'horizondex', 'secta', 'echodex', 'kyberswap', 'metavault', 'leetswap', 'satori', 'diamondswap', 'velocore'],
    'shibarium': ['shibaswap', 'chewyswap', 'woofswap', 'marswap', 'punkswap', 'shibbex', 'dogswap', 'woof', 'leetswap'],
    'near': ['rhea-finance'],
    'icp': ['icpswap', 'icpex', 'sonic'],
    'unichain': ['uniswap', 'unichainswap', 'dyorswap'],
    'multiversx': ['xexchange', 'onedex'],
    'zksync': ['pancakeswap', 'syncswap', 'zkswap', 'oku', 'spacefi', 'koi', 'iziswap', 'velocore', 'ezkalibur', 'vesync', 'gemswap', 'wagmi', 'derpdex', 'draculafi', 'holdstation', 'gameswap'],
    'fantom': ['spookyswap', 'wigoswap', 'beethovenx', 'spiritswap', 'equalizer', 'pyreswap', 'velocimeter', 'protofi', 'morpheusswap', 'hyperjump', 'solidly', 'tombswap', 'sushiswap', 'paintswap', 'lif3', 'solidlycom', 'farmtom', 'degenhaus', 'redemption', 'knightswap', 'soulswap', 'excalibur', 'elkfinance', 'yoshiexchange', 'wingswap', 'bombswap', 'jetswap', 'skullswap', 'memebox', 'defyswap', 'kyberswap', 'wagmi', 'empiredex', 'fraxswap'],
    'blast': ['thruster', 'ring', 'fenix', 'blade', 'uniswap', 'ambient', 'blaster', 'monoswap', 'roguex', 'sushiswap', 'swapblast', 'cyberblast', 'hyperblast', 'diamondswap', 'dyorswap', 'bitdex', 'dackieswap', 'icecreamswap'],
    'apechain': ['camelot', 'saru', 'dyorswap'],
    'starknet': ['ekubo', 'jediswap', 'nostra', 'sithswap'],
    'algorand': ['tinyman'],
    'soneium': ['velodrome', 'kyo-finance', 'sonex', 'sonus', 'sonefi', 'dyorswap'],
    'mantle': ['merchantmoe', 'agni', 'cleo', 'fusionx', 'methlab', 'funny-money', 'iziswap', 'butter.xyz', 'crust', 'swapsicle', 'velocimeter'],
    'cardano': ['minswap', 'wingriders', 'sundaeswap'],
    'vana': ['datadex'],
    'injective': ['dojoswap'],
    'story': ['piperx', 'storyhunt', 'story-fun'],
    'dogechain': ['quickswap', 'dogeswap', 'fraxswap', 'kibbleswap', 'yodeswap', 'dogeshrek', 'bourbondefi', 'pupswap'],
    'flowevm': ['punchswap'],
    'core': ['glyph', 'corex', 'sushiswap', 'archerswap', 'shadowswap', 'longswap', 'icecreamswap', 'lfgswap', 'viridian'],
    'venom': ['web3world'],
    'flare': ['sparkdex', 'blazeswap', 'enosys', 'pangolin'],
    'katana': ['sushiswap'],
    'moonbeam': ['solarflare', 'stellaswap', 'zenlink', 'beamswap', 'padswap', 'lunardex', 'sunflowerswap', 'dustydunes', 'thorus', 'sushiswap'],
    'metis': ['netswap', 'wagmi', 'hercules', 'tethys', 'uni-maia', 'hermesprotocol', 'sushiswap'],
    'avalanchedfk': ['defikingdoms'],
    'scroll': ['nuri', 'ambient', 'syncswap', 'oku', 'iziswap', 'sushiswap', 'zebra', 'skydrome', 'spacefi', 'kyberswap', 'scribe', 'punkswap', 'scrollswap', 'zada-finance', 'tokan', 'metavault', 'papyrusswap', 'icecreamswap', 'luigiswap', 'cattieswap', 'leetswap'],
    'merlinchain': ['merlinswap'],
    'beam': ['beam-swap'],
    'harmony': ['sushiswap', 'swap', 'tranquilfinance', 'defikingdoms', 'viperswap', 'openswap', 'lootswap', 'mochiswap', 'hermesdefi', 'foxswap', 'wagmidao', 'bossswap', 'sonicswap', 'elkfinance', 'fuzzswap'],
    'celo': ['uniswap', 'velodrome', 'ubeswap', 'sushiswap'],
    'ethereumpow': ['lfgswap', 'uniswap', 'powswap', 'sushiswap', 'hippowswap', 'cakewswap', 'defiswap', 'empiredex', 'powsea', 'pyeswap', 'radioshack', 'safemoonswap', 'shibaswap', 'stepn', 'swapr', 'templedao', 'vulcandex'],
    'fraxtal': ['raexchange', 'velodrome', 'fraxswap'],
    'ethereumclassic': ['etcmc', 'hebeswap'],
    'kava': ['wagmi', 'kinetix', 'equilibre', 'elkfinance', 'surfswap', 'photonswap'],
    'oasissapphire': ['neby', 'illuminex'],
    'mode': ['velodrome', 'kim', 'poolshark', 'swapmode', 'supswap', 'dyorswap', 'dackieswap'],
    'manta': ['quickswap', 'pacificswap', 'aperture-swap', 'gullnetwork', 'iziswap', 'oku', 'firefly', 'cetoswap', 'leetswap'],
    'conflux': ['swappi'],
    'zetachain': ['beam', 'sushiswap', 'abstradex', 'dyorswap', 'zedaswap'],
    'gnosischain': ['sushiswap', 'honeyswap', 'swapr', 'elkfinance', 'baofinance'],
    'energi': ['energiswap'],
    'astar': ['arthswap', 'zenlink', 'versa', 'polkaex', 'astarexchange', 'agsfinance', 'funbeast'],
    'opbnb': ['pancakeswap', 'cubiswap', 'thena', 'derpdex', 'binaryswap', 'fourdex', 'pixelswap', 'luigiswap', 'knightdex', 'diamondswap', 'leetswap', 'udex'],
    'zircuit': ['ocelex', 'zuit'],
    'zora': ['uniswap'],
    'bouncebit': ['bitswap'],
    'arbitrumnova': ['sushiswap', 'arbswap', 'rcpswap'],
    'polygonzkevm': ['quickswap', 'pancakeswap', 'doveswap', 'sushiswap', 'leetswap'],
    'movement': ['yuzu'],
    'aurora': ['trisolaris', 'auroraswap', 'wannaswap', 'nearpad', 'amaterasu', 'iziswap', 'mindgames', 'polaris'],
    'evmos': ['forge', 'spacefi', 'evmoswap', 'cronusfinance', 'diffusion'],
    'iotex': ['mimo', 'elkfinance'],
    'taiko': ['oku', 'ritsu', 'kodo'],
    'boba': ['oku', 'sushiswap', 'oolongswap'],
    'degenchain': ['dyorswap', 'frog-swap', 'degendex', 'degenswap', 'proxyswap'],
    'telos': ['swapsicle', 'apeswap', 'elkfinance', 'icecreamswap', 'omnidex', 'sushiswap', 'zappy'],
    'loopnetwork': ['sphynx'],
    'moonriver': ['solarbeam', 'sushiswap', 'huckleberry', 'zenlink', 'elkfinance', 'padswap', 'seadex'],
    'elastos': ['glidefinance', 'elkfinance'],
    'kcc': ['mojitoswap', 'kuswap', 'kudex', 'koffeeswap'],
    'neonevm': ['icecreamswap', 'moraswap'],
    'meter': ['voltswap'],
    'oasisemerald': ['gemkeeper', 'yuzuswap', 'duneswap', 'rimswap', 'lizardexchange', 'tulipswap'],
    'stepnetwork': ['stepdex'],
    'fuse': ['voltagefinance', 'elkfinance', 'sushiswap'],
    'polkadot': ['hydration'],
    'zkfair': ['abstradex', 'sideswap'],
    'bitgert': ['icecreamswap', 'sphynx'],
    'velas': ['wagyuswap', 'astroswap', 'jungleswap']
}

# Daftar semua DEX yang didukung
ALLOWED_DEX = set()
for chain_dexes in ALLOWED_CHAINS.values():
    ALLOWED_DEX.update(chain_dexes)
ALLOWED_DEX = list(ALLOWED_DEX)

ALLOWED_TRENDING = ['m5', 'h1', 'h6', 'h24']

def generate_sec_websocket_key():
    return base64.b64encode(os.urandom(16)).decode()

def extract_pair_addresses(data_str):
    sol_pairs = re.findall(r'([A-Za-z0-9]{40}pump)', data_str)
    eth_pairs = re.findall(r'(0x[0-9a-fA-F]{40})', data_str)
    return list(set(sol_pairs + eth_pairs))

async def fetch_pairs(ws_url, ws_headers):
    try:
        # Create connection with headers
        ws = await websockets.connect(
            ws_url,
            additional_headers=ws_headers
        )
        
        while True:
            data = await ws.recv()
            if isinstance(data, bytes):
                data_str = data.decode('utf-8', errors='ignore')
            else:
                data_str = data
            if "pairs" in data_str:
                await ws.close()
                return extract_pair_addresses(data_str)
    except Exception as e:
        print(f"Error in fetch_pairs: {str(e)}")
        raise

async def fetch_pair_info(pair_addresses, chain_id=None):
    import aiohttp
    results = []
    async with aiohttp.ClientSession() as session:
        for addr in pair_addresses:
            # Deteksi otomatis chain untuk semua jaringan
            if not chain_id:
                # Untuk address Solana
                if addr.endswith('pump') and len(addr) == 44:
                    used_chain = 'solana'
                # Untuk address ETH/BSC/etc yang dimulai dengan 0x
                elif addr.startswith('0x') and len(addr) == 42:
                    used_chain = 'ethereum'
                else:
                    continue  # Skip jika format tidak dikenal
            else:
                used_chain = chain_id
                
            url = f"https://api.dexscreener.com/token-pairs/v1/{used_chain}/{addr}"
            try:
                async with session.get(url) as resp:
                    if resp.status == 200:
                        results.append(await resp.json())
            except Exception as e:
                print(f"Error fetching {url}: {str(e)}")
                continue
    return results

async def handler(request):
    # Ambil query
    params = request.args
    chain_id = params.get("chainId")  # Remove default value
    dex_id = params.get("dexId")
    trendingscore = params.get("trendingscore", "h6")
    tokenprofile = params.get("tokenprofile", "false") == "true"
    booster = params.get("booster", "false") == "true"
    advertising = params.get("advertising", "false") == "true"

    # Log parameter yang diterima
    print(f"\nRequest Parameters:")
    print(f"chainId: {chain_id}")
    print(f"dexId: {dex_id}")
    print(f"trendingscore: {trendingscore}")
    print(f"tokenprofile: {tokenprofile}")
    print(f"booster: {booster}")
    print(f"advertising: {advertising}")

    # Validasi - Hanya jika chainId disediakan
    if chain_id:
        if chain_id not in ALLOWED_CHAINS:
            return json.dumps({"error": "chainId tidak valid"}), 400
        
        # Validate dexId only if chainId and dexId are specified
        if dex_id and dex_id not in ALLOWED_CHAINS[chain_id]:
            return json.dumps({"error": f"dexId tidak valid untuk {chain_id}"}), 400
    
    if trendingscore not in ALLOWED_TRENDING:
        return json.dumps({"error": "trendingscore tidak valid"}), 400

    # Build wsUrl
    from urllib.parse import urlencode
    ws_url = "wss://io.dexscreener.com/dex/screener/v5/pairs/h24/1"
    query = {
        "rankBy[key]": f"trendingScore{trendingscore.upper()}",
        "rankBy[order]": "desc"
    }
    
    # Hanya tambahkan filter chainId jika ada
    if chain_id:
        query["filters[chainIds][0]"] = chain_id
    
    # Only add dexId if it's specified in the request
    if dex_id:
        query["filters[dexIds][0]"] = dex_id
    if tokenprofile:
        query["filters[enhancedTokenInfo]"] = "true"
    if booster:
        query["filters[activeBoosts][min]"] = "1"
    if advertising:
        query["filters[recentPurchasedImpressions][min]"] = "1"
    ws_url = ws_url + "?" + urlencode(query)

    # Log URL WebSocket yang akan digunakan
    print(f"\nWebSocket URL: {ws_url}")

    sec_websocket_key = generate_sec_websocket_key()
    ws_headers = {
        "Host": "io.dexscreener.com",
        "Origin": "https://dexscreener.com",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-WebSocket-Extensions": "permessage-deflate; client_max_window_bits",
        "Sec-WebSocket-Key": sec_websocket_key,
        "Sec-WebSocket-Version": "13",
        "Connection": "Upgrade",
        "Upgrade": "websocket",
    }

    try:
        # Log sebelum memanggil fetch_pairs
        print("\nStarting to fetch pairs...")
        pairs = await fetch_pairs(ws_url, ws_headers)
        print(f"\nNumber of pairs found: {len(pairs)}")
        
        # Log sebelum memanggil fetch_pair_info
        print("\nStarting to fetch pair info...")
        infos = await fetch_pair_info(pairs, chain_id)
        print(f"\nNumber of pair infos retrieved: {len(infos)}")
        
        return json.dumps({"pairs": infos}), 200
    except Exception as e:
        print(f"\nError occurred: {str(e)}")
        return json.dumps({"error": str(e)}), 500

# Vercel Python entrypoint
def handler_entrypoint(request):
    return asyncio.run(handler(request))