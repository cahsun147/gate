package tokens

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"gateway/cache"
	"gateway/types"

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
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Jaringan tidak valid",
			Message: "success",
		})
		return
	}

	if !allowedOrderBy[orderBy] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Urutan tidak valid",
			Message: "success",
		})
		return
	}

	if !allowedDirections[direction] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Arah tidak valid, hanya 'desc' yang didukung",
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

	if limit < 1 || limit > 100 {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Batas harus antara 1 - 100",
			Message: "success",
		})
		return
	}

	// Konstruksi URL dan params
	baseURL := fmt.Sprintf("https://gmgn.ai/vas/api/v1/token_holders/%s/%s", network, contractAddress)
	params := url.Values{}
	params.Add("limit", strconv.Itoa(limit))
	params.Add("cost", "20")
	params.Add("orderby", orderBy)
	params.Add("direction", direction)
	params.Add("app_lang", "en-US")
	params.Add("os", "web")

	// Hanya sertakan 'tag' jika disediakan dan valid
	if tag != "" && allowedTag[tag] {
		params.Add("tag", tag)
	}

	// Cek cache terlebih dahulu
	cacheKey := fmt.Sprintf("holder:%s:%s:%s:%s:%s", network, contractAddress, limitStr, orderBy, tag)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		fmt.Printf("Cache HIT untuk key: %s\n", cacheKey)
		c.JSON(http.StatusOK, cachedData)
		return
	}

	// Batas percobaan dan jeda
	maxRetries := 10
	retryDelay := time.Duration(0) * time.Second

	for attempt := 0; attempt < maxRetries; attempt++ {
		response, err := makeRequest(baseURL, params)
		if err != nil {
			fmt.Printf("Kesalahan terjadi: %v\n", err)
			c.JSON(http.StatusInternalServerError, types.ErrorResponse{
				Error: "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.",
			})
			return
		}

		if response.StatusCode == http.StatusOK {
			// Parse response
			body, err := io.ReadAll(response.Body)
			response.Body.Close()
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

			c.JSON(http.StatusOK, newData)
			return
		} else if response.StatusCode == http.StatusForbidden {
			response.Body.Close()
			if attempt < maxRetries-1 {
				time.Sleep(retryDelay)
				continue
			} else {
				fmt.Println("Gagal setelah 10 percobaan karena status 403")
				c.JSON(http.StatusServiceUnavailable, types.ErrorResponse{
					Error:   "Server overload, coba lagi nanti",
					Message: "success ;)",
				})
				return
			}
		} else {
			response.Body.Close()
			fmt.Printf("Status kode API: %d\n", response.StatusCode)
			c.JSON(http.StatusInternalServerError, types.ErrorResponse{
				Error: "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.",
			})
			return
		}
	}

	// Fallback jika semua percobaan gagal
	fmt.Println("Gagal setelah semua percobaan")
	c.JSON(http.StatusServiceUnavailable, types.ErrorResponse{
		Error:   "Server overload, coba lagi nanti",
		Message: "Fail get data OnChain",
	})
}
