# test/test/dex.py
# Versi 9: Menambahkan logging detail dan berurutan pada fungsi fetch_pair_info.

import json
import re
import base64
import os
import asyncio
import websockets
import aiohttp
from urllib.parse import urlencode

# Daftar validasi (disingkat untuk keringkasan)
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

ALLOWED_DEX = set(d for chain_dexes in ALLOWED_CHAINS.values() for d in chain_dexes)
ALLOWED_TRENDING = ['m5', 'h1', 'h6', 'h24']

def generate_sec_websocket_key():
    return base64.b64encode(os.urandom(16)).decode()

def extract_contract_addresses(data_str: str) -> list[str]:
    """
    EKSTRAKSI AKURAT: Mengekstrak HANYA alamat KONTRAK untuk EVM, Solana, TON, dan Tron
    berdasarkan aturan pemisah yang spesifik.
    """
    # Pola untuk EVM: T(pair_addr)T(contract_addr)
    evm_contracts = re.findall(r'T(0x[0-9a-fA-F]{40})T(0x[0-9a-fA-F]{40})', data_str)
    
    # Pola untuk Solana: X(pair_addr)X(contract_addr)
    solana_contracts = re.findall(r'X([1-9A-HJ-NP-Za-km-z]{32,44})X([1-9A-HJ-NP-Za-km-z]{32,44})', data_str)

    # Pola untuk TON: `(pair_addr)`(contract_addr)
    ton_contracts = re.findall(r'`(EQ[A-Za-z0-9_-]{46})`(EQ[A-Za-z0-9_-]{46})', data_str)

    # Pola untuk Tron: D(pair_addr)D(contract_addr)
    tron_contracts = re.findall(r'D(T[A-Za-z0-9]{33})D(T[A-Za-z0-9]{33})', data_str)

    sui_contracts = re.findall(r'\x01(0x[a-fA-F0-9]{64})\x01(0x[a-fA-F0-9]{64}::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+)', data_str)

    hyperliquid_contracts = re.findall(r'D(0x[a-fA-F0-9]{32,40})D(0x[a-fA-F0-9]{32,40})', data_str)

    # Menggabungkan hasil dari semua pola, mengambil grup KEDUA (contract address).
    all_contracts = [match[1] for match in evm_contracts] + \
                    [match[1] for match in solana_contracts] + \
                    [match[1] for match in ton_contracts] + \
                    [match[1] for match in tron_contracts] + \
                    [match[1] for match in sui_contracts] + \
                    [match[1] for match in hyperliquid_contracts]
                    

    # Hapus duplikat sambil menjaga urutan
    unique_contracts = list(dict.fromkeys(all_contracts))
    
    # Jangan ambil alamat TON yang merupakan placeholder
    placeholder_ton = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'
    final_contracts = [addr for addr in unique_contracts if addr != placeholder_ton]
    
    print(f"Ditemukan {len(final_contracts)} alamat kontrak dari berbagai chain.")
    return final_contracts

async def fetch_contracts(ws_url, ws_headers):
    try:
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
                return extract_contract_addresses(data_str)
    except Exception as e:
        print(f"Error in fetch_contracts: {str(e)}")
        raise

async def fetch_pair_info(contract_addresses, chain_id):
    """
    Mengambil informasi pasangan berdasarkan alamat KONTRAK dengan logging detail.
    Sekarang menambahkan retry maksimal 3x jika terjadi kegagalan request.
    """
    if not contract_addresses or not chain_id:
        return []

    results = []
    total_contracts = len(contract_addresses)
    async with aiohttp.ClientSession() as session:
        for i, addr in enumerate(contract_addresses):
            url = f"https://api.dexscreener.com/token-pairs/v1/{chain_id}/{addr}"
            print(f"[{i+1}/{total_contracts}] Fetching: {addr}")
            retry_count = 0
            while retry_count < 3:
                try:
                    async with session.get(url) as resp:
                        if resp.status == 200:
                            try:
                                data = await resp.json()
                                pairs_list = None
                                if isinstance(data, dict) and 'pairs' in data:
                                    pairs_list = data.get('pairs')
                                elif isinstance(data, list):
                                    pairs_list = data
                                if pairs_list and len(pairs_list) > 0:
                                    results.append(pairs_list[0])
                                    print(f"[{i+1}/{total_contracts}] SUCCESS: Data berhasil diambil untuk {addr}")
                                    break  # keluar dari loop retry jika sukses
                                else:
                                    print(f"[{i+1}/{total_contracts}] SUCCESS (No Data): Tidak ada data pasangan untuk {addr}")
                                    break  # keluar dari loop retry jika sukses (meski kosong)
                            except Exception as e:
                                print(f"[{i+1}/{total_contracts}] FAILED (JSON Parse): Gagal mem-parsing JSON dari {addr}. Error: {e}")
                                retry_count += 1
                        else:
                            print(f"[{i+1}/{total_contracts}] FAILED (HTTP Status): Gagal mengambil data untuk {addr}. Status: {resp.status}")
                            retry_count += 1
                except Exception as e:
                    print(f"[{i+1}/{total_contracts}] FAILED (Request): Gagal melakukan request untuk {addr}. Error: {e}")
                    retry_count += 1
                if retry_count < 3 and len(results) < (i+1):
                    print(f"[{i+1}/{total_contracts}] RETRYING ({retry_count}/3) untuk {addr}...")
            else:
                print(f"[{i+1}/{total_contracts}] GAGAL setelah 3x percobaan untuk {addr}.")
    return results

async def handler(request):
    params = request.args
    chain_id = params.get("chainId")
    dex_id = params.get("dexId")
    trendingscore = params.get("trendingscore", "h6")
    tokenprofile = params.get("tokenprofile", "false") == "true"
    booster = params.get("booster", "false") == "true"
    advertising = params.get("advertising", "false") == "true"

    print(f"\nRequest Parameters: chainId={chain_id}, dexId={dex_id}")

    # Parameter chainId sekarang wajib agar URL API bisa dibangun dengan benar.
    if not chain_id:
        return json.dumps({"error": "Parameter 'chainId' wajib diisi"}), 400
    
    if chain_id not in ALLOWED_CHAINS:
        return json.dumps({"error": "chainId tidak valid"}), 400
    
    if dex_id and dex_id not in ALLOWED_CHAINS[chain_id]:
        return json.dumps({"error": f"dexId tidak valid untuk {chain_id}"}), 400
    
    if trendingscore not in ALLOWED_TRENDING:
        return json.dumps({"error": "trendingscore tidak valid"}), 400

    ws_url_base = "wss://io.dexscreener.com/dex/screener/v5/pairs/h24/1"
    query = {
        "rankBy[key]": f"trendingScore{trendingscore.upper()}",
        "rankBy[order]": "desc",
        "filters[chainIds][0]": chain_id
    }
    
    if dex_id:
        query["filters[dexIds][0]"] = dex_id
    if tokenprofile:
        query["filters[enhancedTokenInfo]"] = "true"
    if booster:
        query["filters[activeBoosts][min]"] = "1"
    if advertising:
        query["filters[recentPurchasedImpressions][min]"] = "1"
    ws_url = ws_url_base + "?" + urlencode(query)

    print(f"\nWebSocket URL: {ws_url}")

    ws_headers = {
        "Host": "io.dexscreener.com",
        "Origin": "https://dexscreener.com",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        "Sec-WebSocket-Key": generate_sec_websocket_key(),
        "Sec-WebSocket-Version": "13",
    }

    try:
        print("\nStarting to fetch contract addresses...")
        contracts = await fetch_contracts(ws_url, ws_headers)
        print(f"\nNumber of contracts found: {len(contracts)}")
        
        print("\nStarting to fetch pair info using contract addresses...")
        # Memanggil fungsi yang sudah diperbarui
        infos = await fetch_pair_info(contracts, chain_id)
        print(f"\nNumber of pair infos retrieved: {len(infos)}")
        
        return json.dumps({"pairs": infos}), 200
    except Exception as e:
        print(f"\nError occurred: {str(e)}")
        return json.dumps({"error": str(e)}), 500

# Vercel Python entrypoint
def handler_entrypoint(request):
    return asyncio.run(handler(request))
