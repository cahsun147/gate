package dex

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"gateway/cache"
	"gateway/types"

	"github.com/gin-gonic/gin"
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

// GetDex menangani permintaan untuk endpoint /api/v1/dex/:network/:address
func GetDex(c *gin.Context) {
	network := c.Param("network")
	address := c.Param("address")
	chainID := c.Query("chainId")
	dexID := c.Query("dexId")
	trendingScore := c.DefaultQuery("trendingscore", "h6")

	// Validasi chainId jika disediakan
	if chainID != "" {
		if _, ok := allowedChains[chainID]; !ok {
			c.JSON(http.StatusBadRequest, types.ErrorResponse{
				Error: "chainId tidak valid",
			})
			return
		}

		// Validasi dexId jika chainId dan dexId disediakan
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

	// Validasi trendingscore
	if !allowedTrending[trendingScore] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error: "trendingscore tidak valid",
		})
		return
	}

	// Cek cache terlebih dahulu
	cacheKey := fmt.Sprintf("dex:%s:%s:%s:%s", network, address, chainID, dexID)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		fmt.Printf("Cache HIT untuk key: %s\n", cacheKey)
		c.JSON(http.StatusOK, cachedData)
		return
	}

	// Konstruksi URL untuk DexScreener API
	baseURL := "https://api.dexscreener.com/token-pairs/v1"
	if network != "" && address != "" {
		baseURL = fmt.Sprintf("%s/%s/%s", baseURL, network, address)
	}

	params := url.Values{}
	if chainID != "" {
		params.Add("chainId", chainID)
	}
	if dexID != "" {
		params.Add("dexId", dexID)
	}

	// Buat request ke DexScreener
	fullURL := baseURL
	if len(params) > 0 {
		fullURL = baseURL + "?" + params.Encode()
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{
			Error: "Terjadi kesalahan saat membuat request.",
		})
		return
	}

	// Set headers
	req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Origin", "https://dexscreener.com")
	req.Header.Set("Referer", "https://dexscreener.com/")

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

	// Return response
	newData := types.StandardResponse{
		MadeBy:  "Xdeployments",
		Message: "ok",
		Data:    apiData,
	}

	// Simpan ke cache dengan TTL 60 detik (soft fail jika Redis tidak tersedia)
	if err := cache.SetCache(cacheKey, newData, 60*time.Second); err != nil {
		fmt.Printf("Warning: Gagal menyimpan cache untuk key %s: %v\n", cacheKey, err)
	}

	c.JSON(http.StatusOK, newData)
}
