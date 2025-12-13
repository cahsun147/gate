package dex

import (
	"crypto/rand"
	"crypto/tls"
	"encoding/base64"
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

func fetchPairsViaWS(wsURL string) ([]string, error) {
	dialer := websocket.Dialer{
		HandshakeTimeout:  15 * time.Second,
		EnableCompression: true,
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
	}

	header := http.Header{}
	header.Set("Host", "io.dexscreener.com")
	header.Set("Origin", "https://dexscreener.com")
	header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
	header.Set("Accept-Language", "en-US,en;q=0.9")
	header.Set("Accept-Encoding", "gzip, deflate, br, zstd")
	header.Set("Cache-Control", "no-cache")
	header.Set("Pragma", "no-cache")

	// Generate random Sec-WebSocket-Key
	keyBytes := make([]byte, 16)
	_, err := rand.Read(keyBytes)
	if err != nil {
		return nil, fmt.Errorf("gagal generate Sec-WebSocket-Key: %w", err)
	}
	secKey := base64.StdEncoding.EncodeToString(keyBytes)
	header.Set("Sec-WebSocket-Key", secKey)

	var ws *websocket.Conn
	var resp *http.Response
	maxRetries := 5

	for attempt := 1; attempt <= maxRetries; attempt++ {
		ws, resp, err = dialer.Dial(wsURL, header)
		if err == nil {
			break
		}
		fmt.Printf("Retry %d/%d: gagal connect ke WebSocket: %v\n", attempt, maxRetries, err)
		if resp != nil {
			fmt.Printf("Response status: %s\n", resp.Status)
		}
		time.Sleep(time.Duration(attempt) * time.Second) // Exponential backoff
	}

	if err != nil {
		return nil, fmt.Errorf("gagal connect ke WebSocket setelah %d percobaan: %w", maxRetries, err)
	}
	defer ws.Close()

	timeout := time.After(30 * time.Second) // Tambahkan timeout untuk menghindari infinite loop

	for {
		select {
		case <-timeout:
			return nil, fmt.Errorf("timeout: tidak menemukan data 'pairs' dalam waktu yang ditentukan")
		default:
			_, message, err := ws.ReadMessage()
			if err != nil {
				return nil, fmt.Errorf("gagal membaca message dari WebSocket: %w", err)
			}
			dataStr := string(message)
			if dataStr == "ping" {
				ws.WriteMessage(websocket.TextMessage, []byte("pong"))
				continue
			}
			if strings.Contains(dataStr, "pairs") {
				return extractPairAddresses(dataStr), nil
			}
		}
	}
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
		return nil, fmt.Errorf("gagal membuat TLS client: %w", err)
	}

	var wg sync.WaitGroup
	resultsChan := make(chan map[string]interface{}, len(addresses))
	errChan := make(chan error, len(addresses))

	for _, addr := range addresses {
		wg.Add(1)
		go func(address string) {
			defer wg.Done()

			usedChain := chainID
			if usedChain == "" {
				if strings.HasSuffix(address, "pump") && len(address) == 44 {
					usedChain = "solana"
				} else if strings.HasPrefix(address, "0x") && len(address) == 42 {
					usedChain = "ethereum"
				} else {
					return
				}
			}

			apiURL := fmt.Sprintf("https://api.dexscreener.com/token-pairs/v1/%s/%s", usedChain, address)

			req, err := fhttp.NewRequest(http.MethodGet, apiURL, nil)
			if err != nil {
				errChan <- err
				return
			}

			req.Header = fhttp.Header{
				"User-Agent":      {"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"},
				"Accept":          {"application/json"},
				"Accept-Language": {"en-US,en;q=0.9"},
				"Origin":          {"https://dexscreener.com"},
				"Referer":         {"https://dexscreener.com/"},
			}

			resp, err := client.Do(req)
			if err != nil {
				errChan <- err
				return
			}
			defer resp.Body.Close()

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				errChan <- err
				return
			}

			var data map[string]interface{}
			if err := json.Unmarshal(body, &data); err != nil {
				errChan <- err
				return
			}

			resultsChan <- data
		}(addr)
	}

	wg.Wait()
	close(resultsChan)
	close(errChan)

	var results []map[string]interface{}
	for result := range resultsChan {
		results = append(results, result)
	}

	// Ignore errors in errChan for simplicity, or handle them
	return results, nil
}

func GetDex(c *gin.Context) {
	network := c.Param("network")
	address := c.Param("address")
	chainID := c.Query("chainId")
	dexID := c.Query("dexId")
	trendingScore := c.DefaultQuery("trendingscore", "h6")

	if !allowedTrending[trendingScore] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error: "trendingscore tidak valid",
		})
		return
	}

	if network != "" && address != "" {
		handleDetailRequest(c, network, address, chainID, dexID)
	} else {
		handleTrendingRequest(c, chainID, dexID, trendingScore)
	}
}

func handleDetailRequest(c *gin.Context, network, address, chainID, dexID string) {
	if chainID != "" {
		if _, ok := allowedChains[chainID]; !ok {
			c.JSON(http.StatusBadRequest, types.ErrorResponse{
				Error: "chainId tidak valid",
			})
			return
		}

		if dexID != "" {
			validDex := false
			for _, dex := range allowedChains[chainID] {
				if dex == dexID {
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

	cacheKey := fmt.Sprintf("dex:%s:%s:%s:%s", network, address, chainID, dexID)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		fmt.Printf("Cache HIT untuk key: %s\n", cacheKey)
		c.JSON(http.StatusOK, cachedData)
		return
	}

	baseURL := fmt.Sprintf("https://api.dexscreener.com/token-pairs/v1/%s/%s", network, address)

	jar := tls_client.NewCookieJar()
	options := []tls_client.HttpClientOption{
		tls_client.WithTimeoutSeconds(30),
		tls_client.WithClientProfile(profiles.Chrome_124),
		tls_client.WithRandomTLSExtensionOrder(),
		tls_client.WithCookieJar(jar),
	}

	client, err := tls_client.NewHttpClient(tls_client.NewNoopLogger(), options...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{
			Error: "Terjadi kesalahan saat inisialisasi client HTTP.",
		})
		return
	}

	req, err := fhttp.NewRequest(http.MethodGet, baseURL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{
			Error: "Terjadi kesalahan saat membuat request.",
		})
		return
	}

	req.Header = fhttp.Header{
		"User-Agent":      {"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"},
		"Accept":          {"application/json"},
		"Accept-Language": {"en-US,en;q=0.9"},
		"Origin":          {"https://dexscreener.com"},
		"Referer":         {"https://dexscreener.com/"},
	}

	response, err := client.Do(req)
	if err != nil {
		fmt.Printf("Kesalahan terjadi: %v\n", err)
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{
			Error: "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.",
		})
		return
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{
			Error: "Terjadi kesalahan saat membaca respons.",
		})
		return
	}

	var apiData map[string]interface{}
	if err := json.Unmarshal(body, &apiData); err != nil {
		fmt.Println("Kesalahan penguraian JSON")
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{
			Error: "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.",
		})
		return
	}

	newData := types.StandardResponse{
		MadeBy:  "Xdeployments",
		Message: "ok",
		Data:    apiData,
	}

	if err := cache.SetCache(cacheKey, newData, 60*time.Second); err != nil {
		fmt.Printf("Warning: Gagal menyimpan cache untuk key %s: %v\n", cacheKey, err)
	}

	c.JSON(http.StatusOK, newData)
}

func handleTrendingRequest(c *gin.Context, chainID, dexID, trendingScore string) {
	if chainID != "" {
		if _, ok := allowedChains[chainID]; !ok {
			c.JSON(http.StatusBadRequest, types.ErrorResponse{
				Error: "chainId tidak valid",
			})
			return
		}

		if dexID != "" {
			validDex := false
			for _, dex := range allowedChains[chainID] {
				if dex == dexID {
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

	cacheKey := fmt.Sprintf("dex:trending:%s:%s:%s", chainID, dexID, trendingScore)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		fmt.Printf("Cache HIT untuk key: %s\n", cacheKey)
		c.JSON(http.StatusOK, cachedData)
		return
	}

	wsURL := "wss://io.dexscreener.com/dex/screener/pairs/h24/1"
	query := url.Values{}
	query.Set("rankBy[key]", fmt.Sprintf("trendingScore%s", strings.ToUpper(trendingScore)))
	query.Set("rankBy[order]", "desc")

	if chainID != "" {
		query.Set("filters[chainIds][0]", chainID)
	}
	if dexID != "" {
		query.Set("filters[dexIds][0]", dexID)
	}

	wsURL = wsURL + "?" + query.Encode()

	fmt.Printf("WebSocket URL: %s\n", wsURL)

	pairs, err := fetchPairsViaWS(wsURL)
	if err != nil {
		fmt.Printf("Error fetching pairs via WS: %v\n", err)
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{
			Error: "Terjadi kesalahan saat mengambil data trending.",
		})
		return
	}

	fmt.Printf("Number of pairs found: %d\n", len(pairs))

	infos, err := fetchPairInfoParallel(pairs, chainID)
	if err != nil {
		fmt.Printf("Error fetching pair info: %v\n", err)
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{
			Error: "Terjadi kesalahan saat mengambil detail pair.",
		})
		return
	}

	fmt.Printf("Number of pair infos retrieved: %d\n", len(infos))

	newData := types.StandardResponse{
		MadeBy:  "Xdeployments",
		Message: "ok",
		Data: map[string]interface{}{
			"pairs": infos,
		},
	}

	if err := cache.SetCache(cacheKey, newData, 60*time.Second); err != nil {
		fmt.Printf("Warning: Gagal menyimpan cache untuk key %s: %v\n", cacheKey, err)
	}

	c.JSON(http.StatusOK, newData)
}
