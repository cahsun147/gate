package dex

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"

	"gateway/cache"
	"gateway/types"

	fhttp "github.com/bogdanfinn/fhttp"
	tls_client "github.com/bogdanfinn/tls-client"
	"github.com/bogdanfinn/tls-client/profiles"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var allowedChains = map[string][]string{
	"solana":       {"pumpswap", "raydium", "meteora", "orca", "launchlab", "pumpfun", "dexlab", "fluxbeam", "meteoradbc", "moonit", "coinchef", "vertigo", "tokenmill", "superx"},
	"ethereum":     {"uniswap", "curve", "balancer", "pancakeswap", "solidlycom", "sushiswap", "fraxswap", "shibaswap", "ethervista", "defiswap", "verse", "9inch", "lif3", "stepn", "orion", "safemoonswap", "radioshack", "wagmi", "diamondswap", "empiredex", "swapr", "blueprint", "okxdex", "memebox", "kyberswap", "pyeswap", "templedao", "vulcandex"},
	"base":         {"aerodrome", "uniswap", "pancakeswap", "baseswap", "alien-base", "sushiswap", "balancer", "deltaswap", "solidlycom", "swapbased", "dackieswap", "iziswap", "equalizer", "rocketswap", "infusion", "9mm", "shark-swap", "treble", "diamondswap", "velocimeter", "synthswap", "leetswap", "citadelswap", "basex", "robots-farm", "horizondex", "satori", "derpdex", "basofinance", "candy-swap", "cloudbase", "fwx", "throne", "memebox", "icecreamswap", "crescentswap", "moonbase", "kokonutswap", "lfgswap", "oasisswap", "degenbrains", "cbswap", "bakeryswap", "basedswap", "ethervista", "glacier"},
	"bsc":          {"pancakeswap", "uniswap", "thena", "squadswap", "unchain-x", "biswap", "fstswap", "apeswap", "bakeryswap", "coinfair", "tiktokfun", "babyswap", "dinosaureggs", "sushiswap", "mdex", "babydogeswap", "orion", "nomiswap", "dexswap", "tidaldex", "openocean", "knightswap", "autoshark", "safemoonswap", "marsecosystem", "iziswap", "mochiswap", "planetfinance", "elkfinance", "w3swap", "swych", "jetswap", "hyperjump", "coneexchange", "fraxswap", "kyotoswap", "radioshack", "jswap", "baryonswap", "padswap", "traderjoe", "orbitalswap", "saitaswap", "sphynx", "pandora", "leonicorn", "annexfinance", "empiredex", "diamondswap", "pyreswap", "niob", "kyberswap", "pyeswap", "lif3", "ethervista", "aequinox", "vertek"},
	"pulsechain":   {"pulsex", "9mm", "9inch", "pdex", "uniswap", "pulse-rate", "sushiswap", "sparkswap", "dextop", "eazyswap", "velocimeter"},
	"avalanche":    {"pharaoh", "traderjoe", "arenatrade", "uniswap", "pangolin", "aquaspace", "kyberswap", "vapordex", "fraxswap", "hurricaneswap", "lydiafinance", "sushiswap", "radioshack", "swapsicle", "hakuswap", "elkfinance", "alligator", "yetiswap", "partyswap", "glacier", "thorus", "pyreswap", "fwx", "diamondswap", "onavax", "empiredex", "tokenmill"},
	"polygon":      {"quickswap", "uniswap", "balancer", "sushiswap", "dooar", "retro", "apeswap", "dfyn", "vulcandex", "fraxswap", "polycat", "kyberswap", "jetswap", "polyzap", "gravityfinance", "mmfinance", "radioshack", "dinoswap", "dystopia", "comethswap", "nachofinance", "lif3", "elkfinance", "jamonswap", "pearl", "algebra", "firebird", "satin", "empiredex", "safemoonswap", "tetuswap"},
	"arbitrum":     {"uniswap", "pancakeswap", "camelot", "ramses", "sushiswap", "traderjoe", "arbswap", "zyberswap", "spartadex", "deltaswap", "solidlycom", "fraxswap", "kyberswap", "swapr", "chronos", "mmfinance", "solidlizard", "magicswap", "elkfinance", "oreoswap", "arbidex", "swapfish", "aegis", "mindgames", "oasisswap", "auragi", "alienfi", "sharkyswap", "apeswap", "sterling", "dackieswap", "3xcalibur", "arbiswap", "degenbrains", "spinaqdex", "shekelswap", "ethervista", "crescentswap", "dexfi"},
	"optimism":     {"velodrome", "uniswap", "solidlycom", "beethovenx", "sushiswap", "fraxswap", "zipswap", "kyberswap", "openxswap", "superswap", "elkfinance", "dackieswap"},
	"fantom":       {"spookyswap", "wigoswap", "beethovenx", "spiritswap", "equalizer", "pyreswap", "velocimeter", "protofi", "morpheusswap", "hyperjump", "solidly", "tombswap", "sushiswap", "paintswap", "lif3", "solidlycom", "farmtom", "degenhaus", "redemption", "knightswap", "soulswap", "excalibur", "elkfinance", "yoshiexchange", "wingswap", "bombswap", "jetswap", "skullswap", "memebox", "defyswap", "kyberswap", "wagmi", "empiredex", "fraxswap"},
	"blast":        {"thruster", "ring", "fenix", "blade", "uniswap", "ambient", "blaster", "monoswap", "roguex", "sushiswap", "swapblast", "cyberblast", "hyperblast", "diamondswap", "dyorswap", "bitdex", "dackieswap", "icecreamswap"},
	"zksync":       {"pancakeswap", "syncswap", "zkswap", "oku", "spacefi", "koi", "iziswap", "velocore", "ezkalibur", "vesync", "gemswap", "wagmi", "derpdex", "draculafi", "holdstation", "gameswap"},
	"linea":        {"lynex", "nile", "pancakeswap", "syncswap", "oku", "iziswap", "sushiswap", "horizondex", "secta", "echodex", "kyberswap", "metavault", "leetswap", "satori", "diamondswap", "velocore"},
	"scroll":       {"nuri", "ambient", "syncswap", "oku", "iziswap", "sushiswap", "zebra", "skydrome", "spacefi", "kyberswap", "scribe", "punkswap", "scrollswap", "zada-finance", "tokan", "metavault", "papyrusswap", "icecreamswap", "luigiswap", "cattieswap", "leetswap"},
	"mantle":       {"merchantmoe", "agni", "cleo", "fusionx", "methlab", "funny-money", "iziswap", "butter.xyz", "crust", "swapsicle", "velocimeter"},
	"mode":         {"velodrome", "kim", "poolshark", "swapmode", "supswap", "dyorswap", "dackieswap"},
	"manta":        {"quickswap", "pacificswap", "aperture-swap", "gullnetwork", "iziswap", "oku", "firefly", "cetoswap", "leetswap"},
	"gnosischain":  {"sushiswap", "honeyswap", "swapr", "elkfinance", "baofinance"},
	"celo":         {"uniswap", "velodrome", "ubeswap", "sushiswap"},
	"moonbeam":     {"solarflare", "stellaswap", "zenlink", "beamswap", "padswap", "lunardex", "sunflowerswap", "dustydunes", "thorus", "sushiswap"},
	"moonriver":    {"solarbeam", "sushiswap", "huckleberry", "zenlink", "elkfinance", "padswap", "seadex"},
	"harmony":      {"sushiswap", "swap", "tranquilfinance", "defikingdoms", "viperswap", "openswap", "lootswap", "mochiswap", "hermesdefi", "foxswap", "wagmidao", "bossswap", "sonicswap", "elkfinance", "fuzzswap"},
	"metis":        {"netswap", "wagmi", "hercules", "tethys", "uni-maia", "hermesprotocol", "sushiswap"},
	"astar":        {"arthswap", "zenlink", "versa", "polkaex", "astarexchange", "agsfinance", "funbeast"},
	"aurora":       {"trisolaris", "auroraswap", "wannaswap", "nearpad", "amaterasu", "iziswap", "mindgames", "polaris"},
	"evmos":        {"forge", "spacefi", "evmoswap", "cronusfinance", "diffusion"},
	"kava":         {"wagmi", "kinetix", "equilibre", "elkfinance", "surfswap", "photonswap"},
	"telos":        {"swapsicle", "apeswap", "elkfinance", "icecreamswap", "omnidex", "sushiswap", "zappy"},
	"fuse":         {"voltagefinance", "elkfinance", "sushiswap"},
	"boba":         {"oku", "sushiswap", "oolongswap"},
	"opbnb":        {"pancakeswap", "cubiswap", "thena", "derpdex", "binaryswap", "fourdex", "pixelswap", "luigiswap", "knightdex", "diamondswap", "leetswap", "udex"},
	"polygonzkevm": {"quickswap", "pancakeswap", "doveswap", "sushiswap", "leetswap"},
	"arbitrumnova": {"sushiswap", "arbswap", "rcpswap"},
	"iotex":        {"mimo", "elkfinance"},
	"tron":         {"sunswap"},
	"ton":          {"stonfi", "dedust"},
	"sui":          {"bluefin", "cetus", "turbos-finance", "aftermath", "flowx", "bluemove"},
	"aptos":        {"thala", "cellana", "liquidswap", "pancakeswap", "aux", "animeswap"},
	"starknet":     {"ekubo", "jediswap", "nostra", "sithswap"},
	"osmosis":      {"osmosis"},
	"injective":    {"dojoswap"},
	"hyperliquid":  {"hyperliquid"},
	"xrpl":         {"xrpl"},
}

var allowedTrending = map[string]bool{
	"m5":  true,
	"h1":  true,
	"h6":  true,
	"h24": true,
}

// GetDex menangani permintaan untuk endpoint /api/v1/dex
func GetDex(c *gin.Context) {
	network := c.Param("network")
	address := c.Param("address")
	chainID := c.Query("chainId")
	dexID := c.Query("dexId")
	trendingScore := c.DefaultQuery("trendingscore", "h6")

	// 1. Jika URL detail (ada network & address) - Handle Detail Request
	if network != "" && address != "" {
		handleDetailRequest(c, network, address)
		return
	}

	// 2. Jika URL Screener (Trending) - Handle Screener Request
	if !allowedTrending[trendingScore] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error: "trendingscore tidak valid",
		})
		return
	}

	// Cek Cache Screener
	cacheKey := fmt.Sprintf("dex:screener:%s:%s:%s", chainID, dexID, trendingScore)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		c.JSON(http.StatusOK, cachedData)
		return
	}

	// Fetch via WS (v6 dengan Retry Logic)
	pairs, err := fetchPairsViaWS(chainID, dexID, trendingScore)
	if err != nil {
		fmt.Printf("Error fetching pairs via WS: %v\n", err)
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{
			Error: "Terjadi kesalahan saat mengambil data trending.",
		})
		return
	}

	// Batasi jumlah pair untuk detail fetching agar tidak timeout
	limit := 15
	if len(pairs) > limit {
		pairs = pairs[:limit]
	}

	// Fetch Detailed Info Parallel
	infos, err := fetchPairInfoParallel(pairs, chainID)

	// Prepare Response
	newData := types.StandardResponse{
		MadeBy:  "Xdeployments",
		Message: "ok",
		Data: map[string]interface{}{
			"pairs": infos,
		},
	}

	// Save to Cache
	cache.SetCache(cacheKey, newData, 60*time.Second)

	c.JSON(http.StatusOK, newData)
}

// Helper: Fetch Pairs via WS (v6 + Clean Headers + Retry)
func fetchPairsViaWS(chainID, dexID, trendingScore string) ([]string, error) {
	// 1. Setup Headers (Strict Match dengan Python dex.py)
	header := http.Header{}
	header.Set("Host", "io.dexscreener.com")
	header.Set("Origin", "https://dexscreener.com")
	// User-Agent Linux (Sama seperti dex.py)
	header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36")
	header.Set("Accept-Language", "en-US,en;q=0.9")
	header.Set("Accept-Encoding", "gzip, deflate, br, zstd")

	// 🔥 PERBAIKAN PENTING:
	// Hapus header "Sec-WebSocket-Extensions" manual karena 'EnableCompression: true' akan menambahkannya otomatis.
	// Hapus header Cache-Control & Pragma (agar clean).

	// 2. Setup Dialer
	dialer := websocket.Dialer{
		HandshakeTimeout:  30 * time.Second,
		EnableCompression: true, // Ini otomatis set header Sec-WebSocket-Extensions
		TLSClientConfig:   &tls.Config{InsecureSkipVerify: true},
	}

	// 3. Build URL (API v6, Path Static h24/1)
	wsURL := "wss://io.dexscreener.com/dex/screener/v6/pairs/h24/1"

	q := url.Values{}
	// Dynamic Query Params
	q.Set("rankBy[key]", fmt.Sprintf("trendingScore%s", strings.ToUpper(trendingScore)))
	q.Set("rankBy[order]", "desc")

	if chainID != "" {
		q.Set("filters[chainIds][0]", chainID)
	}
	if dexID != "" {
		q.Set("filters[dexIds][0]", dexID)
	}

	fullURL := wsURL + "?" + q.Encode()

	// 4. Retry Logic (Mencoba 5 kali)
	var conn *websocket.Conn
	var err error
	maxConnRetries := 5

	for i := 0; i < maxConnRetries; i++ {
		conn, _, err = dialer.Dial(fullURL, header)
		if err == nil {
			break // Berhasil, keluar loop
		}

		fmt.Printf("Retry %d/%d: gagal connect ke WebSocket: %v\n", i+1, maxConnRetries, err)
		time.Sleep(1 * time.Second) // Jeda 1 detik sebelum retry
	}

	if err != nil {
		return nil, fmt.Errorf("gagal connect ke WebSocket setelah %d percobaan: %w", maxConnRetries, err)
	}
	defer conn.Close()

	// 5. Read Loop (Mencari pesan yang berisi "pairs")
	maxReadRetries := 5
	conn.SetReadDeadline(time.Now().Add(10 * time.Second))

	for i := 0; i < maxReadRetries; i++ {
		_, message, err := conn.ReadMessage()
		if err != nil {
			return nil, err
		}

		dataStr := string(message)

		// Cek apakah pesan ini berisi data pairs
		if strings.Contains(dataStr, "pairs") {
			return extractPairAddresses(dataStr), nil
		}
		// Jika pesan handshake (misal '1.3.0'), abaikan dan lanjut loop
	}

	return nil, fmt.Errorf("timeout: tidak menerima data pairs setelah %d pesan", maxReadRetries)
}

func extractPairAddresses(dataStr string) []string {
	solPattern := regexp.MustCompile(`([A-Za-z0-9]{40}pump)`)
	ethPattern := regexp.MustCompile(`(0x[0-9a-fA-F]{40})`)

	solPairs := solPattern.FindAllString(dataStr, -1)
	ethPairs := ethPattern.FindAllString(dataStr, -1)

	seen := make(map[string]bool)
	var result []string
	for _, pair := range append(solPairs, ethPairs...) {
		if !seen[pair] {
			seen[pair] = true
			result = append(result, pair)
		}
	}
	return result
}

func fetchPairInfoParallel(addresses []string, chainID string) ([]map[string]interface{}, error) {
	jar := tls_client.NewCookieJar()
	options := []tls_client.HttpClientOption{
		tls_client.WithTimeoutSeconds(30),
		tls_client.WithClientProfile(profiles.Chrome_124),
		tls_client.WithRandomTLSExtensionOrder(),
		tls_client.WithCookieJar(jar),
	}

	client, err := tls_client.NewHttpClient(tls_client.NewNoopLogger(), options...)
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup
	resultsChan := make(chan map[string]interface{}, len(addresses))

	for _, addr := range addresses {
		wg.Add(1)
		go func(address string) {
			defer wg.Done()

			// Auto-detect chain logic
			usedChain := chainID
			if usedChain == "" {
				if strings.HasSuffix(address, "pump") {
					usedChain = "solana"
				} else if strings.HasPrefix(address, "0x") {
					usedChain = "ethereum"
				} else {
					return
				}
			}

			apiURL := fmt.Sprintf("https://api.dexscreener.com/token-pairs/v1/%s/%s", usedChain, address)
			req, _ := fhttp.NewRequest(http.MethodGet, apiURL, nil)
			req.Header = fhttp.Header{
				"User-Agent": {"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36"},
				"Origin":     {"https://dexscreener.com"},
				"Referer":    {"https://dexscreener.com/"},
			}

			resp, err := client.Do(req)
			if err == nil && resp.StatusCode == 200 {
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)

				var items []interface{}
				// API V1 return array of pairs
				if json.Unmarshal(body, &items) == nil && len(items) > 0 {
					if itemMap, ok := items[0].(map[string]interface{}); ok {
						resultsChan <- itemMap
					}
				}
			}
		}(addr)
	}

	wg.Wait()
	close(resultsChan)

	var results []map[string]interface{}
	for res := range resultsChan {
		results = append(results, res)
	}
	return results, nil
}

func handleDetailRequest(c *gin.Context, network, address string) {
	infos, _ := fetchPairInfoParallel([]string{address}, network)
	var data interface{} = nil
	if len(infos) > 0 {
		data = infos // Return as list to match previous structure or infos[0] based on preference
	}

	c.JSON(http.StatusOK, types.StandardResponse{
		MadeBy:  "Xdeployments",
		Message: "ok",
		Data:    data,
	})
}
