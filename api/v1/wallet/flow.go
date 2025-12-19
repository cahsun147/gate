package wallet

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"gateway/cache"
	"gateway/types"

	"github.com/RomainMichau/cloudscraper_go/cloudscraper"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetFlow menangani permintaan untuk endpoint /api/v1/wallet/flow/:network/:address
func GetFlow(c *gin.Context) {
	network := c.Param("network")
	walletAddress := c.Param("address")
	period := c.Query("period")

	// Validasi parameter
	if !allowedNetworks[network] {
		c.JSON(400, types.ErrorResponse{
			Error:   "Jaringan tidak valid",
			Message: "success",
		})
		return
	}

	if !allowedPeriods[period] {
		c.JSON(400, types.ErrorResponse{
			Error:   "Period tidak valid",
			Message: "success",
		})
		return
	}

	// Konstruksi URL
	baseURL := fmt.Sprintf("https://gmgn.ai/api/v1/wallet_stat/%s/%s/%s", network, walletAddress, period)

	// Generate params dengan nilai dinamis untuk bypass Cloudflare
	deviceID := uuid.New().String()
	fpDid := strings.ReplaceAll(uuid.New().String(), "-", "")[:32]
	appVer := "20251219-8915-e793f7a"

	// Cek cache terlebih dahulu
	cacheKey := fmt.Sprintf("wallet:flow:%s:%s:%s", network, walletAddress, period)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		fmt.Printf("Cache HIT untuk key: %s\n", cacheKey)
		c.JSON(200, cachedData)
		return
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
	maxRetries := 20

	for attempt := 0; attempt < maxRetries; attempt++ {
		// Buat URL dengan query parameters
		fullURL := baseURL + "?"
		fullURL += "period=" + period + "&"
		fullURL += "device_id=" + deviceID + "&"
		fullURL += "fp_did=" + fpDid + "&"
		fullURL += "from_app=gmgn&"
		fullURL += "app_ver=" + appVer + "&"
		fullURL += "tz_name=Asia/Jakarta&"
		fullURL += "tz_offset=25200&"
		fullURL += "app_lang=en-US&"
		fullURL += "os=web&"
		fullURL += "worker=0"

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

			// Extract statistics data dari response
			statisticsData := map[string]interface{}{}
			if dataMap, ok := apiData["data"].(map[string]interface{}); ok {
				statisticsData = dataMap
			}

			newData := types.StandardResponse{
				MadeBy:  "Xdeployments",
				Message: "ok",
				Data: map[string]interface{}{
					"datawallet": map[string]interface{}{
						"statistics": statisticsData,
					},
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
