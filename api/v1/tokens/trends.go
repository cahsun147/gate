package tokens

import (
	"encoding/json"
	"fmt"
	"time"

	"gateway/cache"
	"gateway/types"

	"github.com/RomainMichau/cloudscraper_go/cloudscraper"
	"github.com/gin-gonic/gin"
)

var allowedNetworks = map[string]bool{
	"sol":   true,
	"eth":   true,
	"base":  true,
	"bsc":   true,
	"tron":  true,
	"blast": true,
}

// GetTrends menangani permintaan untuk endpoint /api/v1/tokens/trends/:network/:contract_address
func GetTrends(c *gin.Context) {
	network := c.Param("network")
	contractAddress := c.Param("contract_address")

	// Validasi parameter
	if !allowedNetworks[network] {
		c.JSON(400, types.ErrorResponse{
			Error:   "Jaringan tidak valid",
			Message: "success",
		})
		return
	}

	// Cek cache terlebih dahulu
	cacheKey := fmt.Sprintf("trends:%s:%s", network, contractAddress)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		fmt.Printf("Cache HIT untuk key: %s\n", cacheKey)
		c.JSON(200, cachedData)
		return
	}

	// Konstruksi URL
	baseURL := fmt.Sprintf("https://gmgn.ai/api/v1/token_trends/%s/%s", network, contractAddress)

	// Array trends_type parameter
	trendsTypes := []string{
		"avg_holding_balance",
		"holder_count",
		"top10_holder_percent",
		"top100_holder_percent",
		"bluechip_owner_percent",
		"insider_percent",
	}

	// Inisialisasi cloudscraper client
	client, err := cloudscraper.Init(false, false)
	if err != nil {
		fmt.Printf("Kesalahan terjadi: %v\n", err)
		c.JSON(500, types.ErrorResponse{
			Error: "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.",
		})
		return
	}

	// Header untuk meniru browser
	headers := map[string]string{
		"User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
		"Accept":          "application/json, text/plain, */*",
		"Accept-Language": "en-US,en;q=0.9",
		"Referer":         "https://gmgn.ai/",
		"Sec-Fetch-Dest":  "empty",
		"Sec-Fetch-Mode":  "cors",
		"Sec-Fetch-Site":  "same-origin",
	}

	// Batas percobaan tanpa delay (instant retry untuk kecepatan maksimal)
	maxRetries := 30

	for attempt := 0; attempt < maxRetries; attempt++ {
		// Buat URL dengan query parameters (array parameter)
		fullURL := baseURL + "?"
		for _, trendType := range trendsTypes {
			fullURL += "trends_type=" + trendType + "&"
		}
		fullURL += "app_lang=en-US&os=web"

		// Lakukan request dengan cloudscraper
		response, err := client.Get(fullURL, headers, "")
		if err != nil {
			fmt.Printf("Retry %d/%d: Kesalahan terjadi: %v\n", attempt+1, maxRetries, err)
			if attempt < maxRetries-1 {
				continue
			}
			c.JSON(500, types.ErrorResponse{
				Error: "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.",
			})
			return
		}

		statusCode := response.Status
		if statusCode == 200 {
			// Parse response body
			var apiData map[string]interface{}
			if err := json.Unmarshal([]byte(response.Body), &apiData); err != nil {
				fmt.Println("Kesalahan penguraian JSON")
				c.JSON(500, types.ErrorResponse{
					Error: "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.",
				})
				return
			}

			// Extract trends dari response
			trends := []interface{}{}
			if dataMap, ok := apiData["data"].(map[string]interface{}); ok {
				if trendsData, ok := dataMap["trends"]; ok {
					trends = trendsData.([]interface{})
				}
			}

			newData := types.StandardResponse{
				MadeBy:  "Xdeployments",
				Message: "ok",
				Data: types.TrendsData{
					ChartTrends: trends,
				},
			}

			// Simpan ke cache dengan TTL 60 detik (soft fail jika Redis tidak tersedia)
			if err := cache.SetCache(cacheKey, newData, 60*time.Second); err != nil {
				fmt.Printf("Warning: Gagal menyimpan cache untuk key %s: %v\n", cacheKey, err)
			}

			c.JSON(200, newData)
			return
		} else if statusCode == 403 {
			fmt.Printf("Retry %d/%d: Status 403, retry...\n", attempt+1, maxRetries)
			if attempt < maxRetries-1 {
				continue
			} else {
				fmt.Printf("Gagal setelah %d percobaan karena status 403\n", maxRetries)
				c.JSON(503, types.ErrorResponse{
					Error:   "Server overload, coba lagi nanti",
					Message: "success ;)",
				})
				return
			}
		} else {
			fmt.Printf("Retry %d/%d: Status kode API: %d\n", attempt+1, maxRetries, statusCode)
			if attempt < maxRetries-1 {
				continue
			}
			c.JSON(500, types.ErrorResponse{
				Error: "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.",
			})
			return
		}
	}

	// Fallback jika semua percobaan gagal
	fmt.Printf("Gagal setelah %d percobaan\n", maxRetries)
	c.JSON(503, types.ErrorResponse{
		Error:   "Server overload, coba lagi nanti",
		Message: "Fail get data OnChain",
	})
}
