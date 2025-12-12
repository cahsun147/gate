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

var allowedOrderByTraders = map[string]bool{
	"buy_volume_cur":    true,
	"sell_volume_cur":   true,
	"profit":            true,
	"realized_profit":   true,
	"unrealized_profit": true,
}

// TradersData adalah struktur data untuk endpoint traders
type TradersData struct {
	TradersList []map[string]interface{} `json:"traderslist"`
}

// TradersResponse adalah format respons khusus untuk traders
type TradersResponse struct {
	MadeBy      string      `json:"made by"`
	Message     string      `json:"message"`
	DataTraders TradersData `json:"datatraders"`
}

// GetTraders menangani permintaan untuk endpoint /api/v1/tokens/traders/:network/:contract_address
func GetTraders(c *gin.Context) {
	network := c.Param("network")
	contractAddress := c.Param("contract_address")
	limitStr := c.Query("limit")
	orderBy := c.Query("orderby")
	direction := c.Query("direction")
	tag := c.Query("tag")

	// Validasi parameter
	if !allowedNetworks[network] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error: "Jaringan tidak valid",
		})
		return
	}

	if !allowedOrderByTraders[orderBy] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error: "Urutan tidak valid",
		})
		return
	}

	if !allowedDirections[direction] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error: "Arah tidak valid, hanya 'desc' yang didukung",
		})
		return
	}

	// Validasi dan konversi limit
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error: "Batas harus berupa bilangan bulat",
		})
		return
	}

	if limit < 1 || limit > 100 {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error: "Batas harus antara 1 dan 100",
		})
		return
	}

	// Konstruksi URL dan params
	baseURL := fmt.Sprintf("https://gmgn.ai/vas/api/v1/token_traders/%s/%s", network, contractAddress)
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
	cacheKey := fmt.Sprintf("traders:%s:%s:%s:%s:%s", network, contractAddress, limitStr, orderBy, tag)
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

			// Extract traders dari response
			traders := []map[string]interface{}{}
			if dataMap, ok := apiData["data"].(map[string]interface{}); ok {
				if listData, ok := dataMap["list"].([]interface{}); ok {
					// Transformasi setiap trader untuk menghilangkan 'avatar'
					for _, traderInterface := range listData {
						if trader, ok := traderInterface.(map[string]interface{}); ok {
							// Buat trader baru tanpa field 'avatar'
							newTrader := make(map[string]interface{})
							for k, v := range trader {
								if k != "avatar" {
									newTrader[k] = v
								}
							}
							traders = append(traders, newTrader)
						}
					}
				}
			}

			newData := TradersResponse{
				MadeBy:  "Xdeployments",
				Message: "ok",
				DataTraders: TradersData{
					TradersList: traders,
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
