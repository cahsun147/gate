package tokens

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"gateway/cache"
	"gateway/types"

	"github.com/RomainMichau/cloudscraper_go/cloudscraper"
	"github.com/gin-gonic/gin"
)

var allowedOrderBy = map[string]bool{
	"last_active_timestamp": true,
	"amount_percentage":     true,
	"sell_volume_cur":       true,
	"buy_volume_cur":        true,
	"profit":                true,
}

var allowedTag = map[string]bool{
	"smart_degen":  true,
	"renowned":     true,
	"dev":          true,
	"fresh_wallet": true,
	"rat_trader":   true,
	"transfer_in":  true,
	"dex_bot":      true,
}

var allowedDirections = map[string]bool{
	"desc": true,
}

// HolderData adalah struktur data untuk endpoint holder
type HolderData struct {
	HolderList []map[string]interface{} `json:"holderlist"`
}

// HolderResponse adalah format respons khusus untuk holder
type HolderResponse struct {
	MadeBy     string     `json:"made by"`
	Message    string     `json:"message"`
	DataHolder HolderData `json:"dataholder"`
}

// GetHolder menangani permintaan untuk endpoint /api/v1/tokens/holder/:network/:contract_address
func GetHolder(c *gin.Context) {
	network := c.Param("network")
	contractAddress := c.Param("contract_address")
	limitStr := c.Query("limit")
	orderBy := c.Query("orderby")
	direction := c.Query("direction")
	tag := c.Query("tag")

	// Validasi parameter
	if !allowedNetworks[network] {
		c.JSON(400, types.ErrorResponse{
			Error:   "Jaringan tidak valid",
			Message: "success",
		})
		return
	}

	if !allowedOrderBy[orderBy] {
		c.JSON(400, types.ErrorResponse{
			Error:   "Urutan tidak valid",
			Message: "success",
		})
		return
	}

	if !allowedDirections[direction] {
		c.JSON(400, types.ErrorResponse{
			Error:   "Arah tidak valid, hanya 'desc' yang didukung",
			Message: "success",
		})
		return
	}

	// Validasi dan konversi limit
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		c.JSON(400, types.ErrorResponse{
			Error:   "Batas harus berupa bilangan bulat",
			Message: "success",
		})
		return
	}

	if limit < 1 || limit > 100 {
		c.JSON(400, types.ErrorResponse{
			Error:   "Batas harus antara 1 - 100",
			Message: "success",
		})
		return
	}

	// Konstruksi URL
	baseURL := fmt.Sprintf("https://gmgn.ai/vas/api/v1/token_holders/%s/%s", network, contractAddress)

	// Konstruksi query parameters
	queryParams := map[string]string{
		"limit":     strconv.Itoa(limit),
		"cost":      "20",
		"orderby":   orderBy,
		"direction": direction,
		"app_lang":  "en-US",
		"os":        "web",
	}

	// Hanya sertakan 'tag' jika disediakan dan valid
	if tag != "" && allowedTag[tag] {
		queryParams["tag"] = tag
	}

	// Cek cache terlebih dahulu
	cacheKey := fmt.Sprintf("holder:%s:%s:%s:%s:%s", network, contractAddress, limitStr, orderBy, tag)
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

	// Batas percobaan dengan exponential backoff
	maxRetries := 20
	baseDelay := 100 * time.Millisecond

	for attempt := 0; attempt < maxRetries; attempt++ {
		// Buat URL dengan query parameters
		fullURL := baseURL
		if len(queryParams) > 0 {
			fullURL += "?"
			first := true
			for k, v := range queryParams {
				if !first {
					fullURL += "&"
				}
				fullURL += k + "=" + v
				first = false
			}
		}

		// Lakukan request dengan cloudscraper
		response, err := client.Get(fullURL, headers, "")
		if err != nil {
			fmt.Printf("Kesalahan terjadi pada attempt %d/%d: %v\n", attempt+1, maxRetries, err)
			if attempt < maxRetries-1 {
				// Exponential backoff: 100ms, 200ms, 400ms, 800ms, dst
				delay := baseDelay * time.Duration(1<<uint(attempt))
				if delay > 5*time.Second {
					delay = 5 * time.Second
				}
				time.Sleep(delay)
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

			// Extract holders dari response
			holders := []map[string]interface{}{}
			if dataMap, ok := apiData["data"].(map[string]interface{}); ok {
				if listData, ok := dataMap["list"].([]interface{}); ok {
					// Transformasi setiap holder untuk menghilangkan 'avatar'
					for _, holderInterface := range listData {
						if holder, ok := holderInterface.(map[string]interface{}); ok {
							// Buat holder baru tanpa field 'avatar'
							newHolder := make(map[string]interface{})
							for k, v := range holder {
								if k != "avatar" {
									newHolder[k] = v
								}
							}
							holders = append(holders, newHolder)
						}
					}
				}
			}

			newData := HolderResponse{
				MadeBy:  "Xdeployments",
				Message: "ok",
				DataHolder: HolderData{
					HolderList: holders,
				},
			}

			// Simpan ke cache dengan TTL 60 detik (soft fail jika Redis tidak tersedia)
			if err := cache.SetCache(cacheKey, newData, 60*time.Second); err != nil {
				fmt.Printf("Warning: Gagal menyimpan cache untuk key %s: %v\n", cacheKey, err)
			}

			fmt.Printf("Berhasil mendapatkan data pada attempt %d/%d\n", attempt+1, maxRetries)
			c.JSON(200, newData)
			return
		} else if statusCode == 403 {
			fmt.Printf("Status 403 pada attempt %d/%d, retry dengan backoff...\n", attempt+1, maxRetries)
			if attempt < maxRetries-1 {
				// Exponential backoff: 100ms, 200ms, 400ms, 800ms, dst
				delay := baseDelay * time.Duration(1<<uint(attempt))
				if delay > 5*time.Second {
					delay = 5 * time.Second
				}
				time.Sleep(delay)
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
			fmt.Printf("Status kode API: %d pada attempt %d/%d\n", statusCode, attempt+1, maxRetries)
			if attempt < maxRetries-1 {
				// Exponential backoff untuk status code lain juga
				delay := baseDelay * time.Duration(1<<uint(attempt))
				if delay > 5*time.Second {
					delay = 5 * time.Second
				}
				time.Sleep(delay)
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
