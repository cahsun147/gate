package wallet

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"gateway/cache"
	"gateway/types"

	"github.com/RomainMichau/cloudscraper_go/cloudscraper"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var allowedOrderByHoldings = map[string]bool{
	"last_active_timestamp": true,
	"unrealized_profit":     true,
	"realized_profit":       true,
	"total_profit":          true,
	"usd_value":             true,
	"history_bought_cost":   true,
	"history_sold_income":   true,
}

var allowedDirections = map[string]bool{
	"asc":  true,
	"desc": true,
}

var allowedFilters = map[string]bool{
	"true":  true,
	"false": true,
}

// GetHoldings menangani permintaan untuk endpoint /api/v1/wallet/holdings/:network/:address
func GetHoldings(c *gin.Context) {
	network := c.Param("network")
	walletAddress := c.Param("address")
	limitStr := c.Query("limit")
	orderBy := c.Query("orderby")
	direction := c.Query("direction")
	showSmall := c.Query("showsmall")
	sellOut := c.Query("sellout")
	hideAbnormal := c.Query("hide_abnormal")

	// Validasi parameter
	if !allowedNetworks[network] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Jaringan tidak valid",
			Message: "success",
		})
		return
	}

	// Validasi dan konversi limit
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Batas harus berupa bilangan bulat",
			Message: "success",
		})
		return
	}

	if limit < 1 || limit > 50 {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Batas harus antara 1 - 50",
			Message: "success",
		})
		return
	}

	if !allowedOrderByHoldings[orderBy] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Urutan tidak valid",
			Message: "success",
		})
		return
	}

	if !allowedDirections[direction] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Arah tidak valid",
			Message: "success",
		})
		return
	}

	if !allowedFilters[showSmall] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Filter showsmall tidak valid",
			Message: "success",
		})
		return
	}

	if !allowedFilters[sellOut] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Filter sellout tidak valid",
			Message: "success",
		})
		return
	}

	if !allowedFilters[hideAbnormal] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Filter hide_abnormal tidak valid",
			Message: "success",
		})
		return
	}

	// Konstruksi URL
	baseURL := fmt.Sprintf("https://gmgn.ai/api/v1/wallet_holdings/%s/%s", network, walletAddress)

	// Generate params dengan nilai dinamis untuk bypass Cloudflare
	deviceID := uuid.New().String()
	fpDid := strings.ReplaceAll(uuid.New().String(), "-", "")[:32]
	appVer := "20251219-8915-e793f7a"

	// Cek cache terlebih dahulu
	cacheKey := fmt.Sprintf("wallet:holdings:%s:%s:%s:%s:%s:%s:%s:%s", network, walletAddress, limitStr, orderBy, direction, showSmall, sellOut, hideAbnormal)
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
		fullURL += "os=web&"
		fullURL += "limit=" + strconv.Itoa(limit) + "&"
		fullURL += "orderby=" + orderBy + "&"
		fullURL += "direction=" + direction + "&"
		fullURL += "showsmall=" + showSmall + "&"
		fullURL += "sellout=" + sellOut + "&"
		fullURL += "hide_abnormal=" + hideAbnormal + "&"
		fullURL += "device_id=" + deviceID + "&"
		fullURL += "fp_did=" + fpDid + "&"
		fullURL += "from_app=gmgn&"
		fullURL += "app_ver=" + appVer + "&"
		fullURL += "tz_name=Asia/Jakarta&"
		fullURL += "tz_offset=25200&"
		fullURL += "app_lang=en-US&"
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

			// Extract holdings dan next dari response
			holdings := []interface{}{}
			nextPage := interface{}(nil)
			if dataMap, ok := apiData["data"].(map[string]interface{}); ok {
				if holdingsData, ok := dataMap["holdings"]; ok {
					holdings = holdingsData.([]interface{})
				}
				if next, ok := dataMap["next"]; ok {
					nextPage = next
				}
			}

			newData := types.StandardResponse{
				MadeBy:  "Xdeployments",
				Message: "ok",
				Data: map[string]interface{}{
					"datawallet": map[string]interface{}{
						"holdingslist": holdings,
						"next":         nextPage,
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
