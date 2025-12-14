package dex

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"

	"gateway/cache"
	"gateway/types"

	// Library CloudScraper
	"github.com/RomainMichau/cloudscraper_go/cloudscraper"

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

func GetDex(c *gin.Context) {
	network := c.Param("network")
	address := c.Param("address")
	chainID := c.Query("chainId")
	dexID := c.Query("dexId")
	trendingScore := c.DefaultQuery("trendingscore", "h6")

	// 1. Mode Detail
	if network != "" && address != "" {
		handleDetailRequest(c, network, address)
		return
	}

	// 2. Mode Screener
	if !allowedTrending[trendingScore] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error: "trendingscore tidak valid",
		})
		return
	}

	// Validasi Input
	if chainID != "" {
		if dexList, ok := allowedChains[chainID]; !ok {
			c.JSON(http.StatusBadRequest, types.ErrorResponse{
				Error: "chainId tidak valid",
			})
			return
		} else if dexID != "" {
			validDex := false
			for _, d := range dexList {
				if d == dexID {
					validDex = true
					break
				}
			}
			if !validDex {
				c.JSON(http.StatusBadRequest, types.ErrorResponse{
					Error: fmt.Sprintf("dexId tidak valid untuk %s", chainID),
				})
				return
			}
		}
	}

	// Cek Cache
	cacheKey := fmt.Sprintf("dex:screener:%s:%s:%s", chainID, dexID, trendingScore)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		c.JSON(http.StatusOK, cachedData)
		return
	}

	// Fetch via WS (Dengan Cookie Injection)
	pairs, err := fetchPairsViaWS(chainID, dexID, trendingScore)
	if err != nil {
		// Log error untuk debugging di Vercel logs
		fmt.Printf("Error fetching pairs via WS: %v\n", err)
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{
			Error: "Gagal mengambil data trending (Mungkin diblokir Cloudflare).",
		})
		return
	}

	// Limit pairs untuk detail fetch
	limit := 15
	if len(pairs) > limit {
		pairs = pairs[:limit]
	}

	// Fetch Detail
	infos, err := fetchPairInfoParallel(pairs, chainID)
	// Ignore partial errors if we got some data
	if err != nil && len(infos) == 0 {
		fmt.Printf("Error fetching details: %v\n", err)
	}
	
	newData := types.StandardResponse{
		MadeBy:  "Xdeployments",
		Message: "ok",
		Data: map[string]interface{}{
			"pairs": infos,
		},
	}

	cache.SetCache(cacheKey, newData, 60*time.Second)
	c.JSON(http.StatusOK, newData)
}

// Helper: Fetch Pairs via WS (DENGAN LOGIKA COOKIE EXTRACTION)
func fetchPairsViaWS(chainID, dexID, trendingScore string) ([]string, error) {
	// --- STEP 1: Pancing Cloudflare untuk dapat Cookie ---
	// Kita request halaman depan DexScreener menggunakan CloudScraper.
	// Jika berhasil, Cloudflare akan memberikan cookie yang valid.
	scraper, err := cloudscraper.Init(false, false)
	var validCookies []string

	if err == nil {
		// Headers minimal untuk pancingan HTTP
		initHeaders := map[string]string{
			"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
		}
		
		// Request ke halaman utama
		resp, err := scraper.Get("https://dexscreener.com", initHeaders, "")
		
		if err == nil && resp.Headers != nil {
			// Cari header 'Set-Cookie' (bisa lowercase atau uppercase tergantung library)
			for key, value := range resp.Headers {
				if strings.ToLower(key) == "set-cookie" {
					// Format cookie: "name=value; Path=/..."
					// Kita butuh bagian "name=value"
					parts := strings.Split(value, ";")
					if len(parts) > 0 {
						validCookies = append(validCookies, parts[0])
					}
				}
			}
		}
	}

	// --- STEP 2: Setup Header WebSocket ---
	header := http.Header{}
	header.Set("Host", "io.dexscreener.com")
	header.Set("Origin", "https://dexscreener.com")
	header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36")
	header.Set("Accept-Language", "en-US,en;q=0.9")
	header.Set("Accept-Encoding", "gzip, deflate, br, zstd")
	
	// INJECTION: Jika kita berhasil dapat cookie, tempelkan!
	if len(validCookies) > 0 {
		cookieStr := strings.Join(validCookies, "; ")
		header.Set("Cookie", cookieStr)
		fmt.Printf("🍪 Cookie Injection Berhasil: %s\n", cookieStr[:15]+"...") // Log pendek
	}

	dialer := websocket.Dialer{
		HandshakeTimeout: 30 * time.Second,
		EnableCompression: true, 
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}

	wsURL := "wss://io.dexscreener.com/dex/screener/v6/pairs/h24/1"
	q := url.Values{}
	q.Set("rankBy[key]", fmt.Sprintf("trendingScore%s", strings.ToUpper(trendingScore)))
	q.Set("rankBy[order]", "desc")
	if chainID != "" { q.Set("filters[chainIds][0]", chainID) }
	if dexID != "" { q.Set("filters[dexIds][0]", dexID) }
	
	fullURL := wsURL + "?" + q.Encode()

	// --- STEP 3: Connect & Retry ---
	var conn *websocket.Conn
	maxConnRetries := 5

	for i := 0; i < maxConnRetries; i++ {
		conn, _, err = dialer.Dial(fullURL, header)
		if err == nil {
			break
		}
		fmt.Printf("Retry %d/%d: gagal connect ke WebSocket: %v\n", i+1, maxConnRetries, err)
		time.Sleep(1 * time.Second)
	}

	if err != nil {
		return nil, fmt.Errorf("gagal connect ke WebSocket setelah %d percobaan: %w", maxConnRetries, err)
	}
	defer conn.Close()

	// --- STEP 4: Read Message ---
	maxReadRetries := 5 
	conn.SetReadDeadline(time.Now().Add(10 * time.Second))

	for i := 0; i < maxReadRetries; i++ {
		_, message, err := conn.ReadMessage()
		if err != nil {
			return nil, err
		}

		dataStr := string(message)
		if strings.Contains(dataStr, "pairs") {
			return extractPairAddresses(dataStr), nil
		}
	}

	return nil, fmt.Errorf("timeout: tidak menerima data pairs")
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
	client, err := cloudscraper.Init(false, false)
	if err != nil {
		return nil, fmt.Errorf("gagal inisialisasi cloudscraper: %v", err)
	}

	var wg sync.WaitGroup
	resultsChan := make(chan map[string]interface{}, len(addresses))
	semaphore := make(chan struct{}, 5) 

	for _, addr := range addresses {
		wg.Add(1)
		go func(address string) {
			defer wg.Done()
			semaphore <- struct{}{} 
			defer func() { <-semaphore }() 
			
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
			
			headers := make(map[string]string)
			headers["Origin"] = "https://dexscreener.com"
			headers["Referer"] = "https://dexscreener.com/"

			resp, err := client.Get(apiURL, headers, "") 
			
			if err == nil && resp.Status == 200 {
				var items []interface{}
				if json.Unmarshal([]byte(resp.Body), &items) == nil && len(items) > 0 {
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
		data = infos
	}
	
	c.JSON(http.StatusOK, types.StandardResponse{
		MadeBy: "Xdeployments", 
		Message: "ok", 
		Data: data,
	})
}