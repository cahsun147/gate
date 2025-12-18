package tokens

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"github.com/RomainMichau/cloudscraper_go/cloudscraper"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var allowedNetworks = []string{
	"sol",
	"eth",
	"base",
	"bsc",
	"tron",
	"blast",
}

func GetTrends(c *gin.Context) {
	network := c.Param("network")
	contractAddress := c.Param("contract_address")

	// Validasi network
	found := false
	for _, n := range allowedNetworks {
		if n == network {
			found = true
			break
		}
	}
	if !found {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jaringan tidak valid", "message": "success"})
		return
	}

	// Konstruksi URL
	url := fmt.Sprintf("https://gmgn.ai/api/v1/token_trends/%s/%s", network, contractAddress)

	// Generate params dengan nilai dinamis untuk bypass Cloudflare
	deviceID := uuid.New().String()
	fpDid := strings.ReplaceAll(uuid.New().String(), "-", "")[:32]
	
	// Fetch appVer otomatis dari file JS
	appVer := fetchAppVersion() // Fungsi baru di bawah
	if appVer == "" {
		// Fallback ke generate random jika gagal fetch
		now := time.Now()
		datePart := now.Format("20060102")
		randBytes := make([]byte, 6)
		_, err := rand.Read(randBytes)
		if err == nil {
			numPart := fmt.Sprintf("%04d", (int(randBytes[0])<<8|int(randBytes[1]))%10000)
			hexPart := hex.EncodeToString(randBytes[2:])[:7]
			appVer = fmt.Sprintf("%s-%s-%s", datePart, numPart, hexPart)
		} else {
			appVer = "20251218-8915-e793f7a" // Default statis
		}
	}

	params := map[string][]string{
		"trends_type": {
			"avg_holding_balance",
			"holder_count",
			"top10_holder_percent",
			"top100_holder_percent",
			"bundler_percent",
			"insider_percent",
			"bot_degen_percent",
			"entrapment_percent",
		},
		"device_id": {deviceID},
		"fp_did":    {fpDid},
		"from_app":  {"gmgn"},
		"app_ver":   {appVer},
		"tz_name":   {"Asia/Jakarta"},
		"tz_offset": {"25200"},
		"app_lang":  {"en-US"},
		"os":        {"web"},
		"worker":    {"0"},
	}

	// Buat scraper
	scraper, err := cloudscraper.Init(false, false)
	if err != nil {
		fmt.Printf("Gagal membuat scraper: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti."})
		return
	}

	// Headers untuk meniru browser
	headers := map[string]string{
		"User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
		"Accept":          "application/json, text/plain, */*",
		"Accept-Language": "en-US,en;q=0.9",
		"Referer":         "https://gmgn.ai/",
		"Sec-Fetch-Dest":  "empty",
		"Sec-Fetch-Mode":  "cors",
		"Sec-Fetch-Site":  "same-origin",
	}

	// Batas retry (instant retry untuk kecepatan maksimal)
	maxRetries := 30

	var apiData map[string]interface{}
	for attempt := 0; attempt < maxRetries; attempt++ {
		// Buat URL dengan query parameters (array parameter)
		fullURL := url + "?"
		for key, values := range params {
			for _, value := range values {
				fullURL += key + "=" + value + "&"
			}
		}
		// Hapus trailing &
		fullURL = fullURL[:len(fullURL)-1]

		// Lakukan request dengan cloudscraper
		response, err := scraper.Get(fullURL, headers, "")
		if err != nil {
			fmt.Printf("Retry %d/%d: Kesalahan terjadi: %v\n", attempt+1, maxRetries, err)
			if attempt < maxRetries-1 {
				continue
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti."})
			return
		}

		statusCode := response.Status
		if statusCode == 200 {
			// Parse response body
			if err := json.Unmarshal([]byte(response.Body), &apiData); err != nil {
				fmt.Println("Kesalahan penguraian JSON")
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti."})
				return
			}
			break
		} else if statusCode == 403 {
			fmt.Printf("Retry %d/%d: Status 403, retry...\n", attempt+1, maxRetries)
			if attempt < maxRetries-1 {
				continue
			} else {
				fmt.Printf("Gagal setelah %d percobaan karena status 403\n", maxRetries)
				c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Server overload, coba lagi nanti", "message": "success ;)"})
				return
			}
		} else {
			fmt.Printf("Retry %d/%d: Status kode API: %d\n", attempt+1, maxRetries, statusCode)
			if attempt < maxRetries-1 {
				continue
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti."})
			return
		}
	}

	if apiData == nil {
		fmt.Println("Gagal setelah semua percobaan")
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Server overload, coba lagi nanti", "message": "Fail get data OnChain"})
		return
	}

	// Ambil trends sebagai map (fix struktur)
	data, ok := apiData["data"].(map[string]interface{})
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Struktur data tidak valid"})
		return
	}
	trends, ok := data["trends"].(map[string]interface{})
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Struktur trends tidak valid"})
		return
	}

	// Buat respons baru
	newData := map[string]interface{}{
		"made by": "Xdeployments",
		"message": "ok",
		"data": map[string]interface{}{
			"chartTrends": trends, // Atau list(trends.Values()) jika butuh slice
		},
	}

	c.JSON(http.StatusOK, newData)
}

// Fungsi baru untuk fetch appVer dari file JS
func fetchAppVersion() string {
jsURL := "https://gmgn.ai/_next/static/chunks/pages/_app-b231a1dddd1e8bb0.js" // Ganti jika hash berubah
resp, err := http.Get(jsURL)
if err != nil {
	fmt.Printf("Gagal fetch JS file: %v\n", err)
	return ""
}
defer resp.Body.Close()

if resp.StatusCode != 200 {
	fmt.Printf("Status kode fetch JS: %d\n", resp.StatusCode)
	return ""
}

body, err := ioutil.ReadAll(resp.Body)
if err != nil {
	fmt.Printf("Gagal baca body JS: %v\n", err)
	return ""
}

jsContent := string(body)
// Cari g.version="value"
startIndex := strings.Index(jsContent, `g.version="`)
if startIndex == -1 {
	fmt.Println("Tidak menemukan g.version di JS file")
	return ""
}
startIndex += len(`g.version="`)
endIndex := strings.Index(jsContent[startIndex:], `"`)
if endIndex == -1 {
	return ""
}
return jsContent[startIndex : startIndex+endIndex]
}
