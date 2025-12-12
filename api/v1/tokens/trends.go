package tokens

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
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Jaringan tidak valid",
			Message: "success",
		})
		return
	}

	// Cek cache terlebih dahulu
	cacheKey := fmt.Sprintf("trends:%s:%s", network, contractAddress)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		fmt.Printf("Cache HIT untuk key: %s\n", cacheKey)
		c.JSON(http.StatusOK, cachedData)
		return
	}

	// Konstruksi URL dan params
	baseURL := fmt.Sprintf("https://gmgn.ai/api/v1/token_trends/%s/%s", network, contractAddress)
	params := url.Values{}
	params.Add("trends_type", "avg_holding_balance")
	params.Add("trends_type", "holder_count")
	params.Add("trends_type", "top10_holder_percent")
	params.Add("trends_type", "top100_holder_percent")
	params.Add("trends_type", "bluechip_owner_percent")
	params.Add("trends_type", "insider_percent")
	params.Add("app_lang", "en-US")
	params.Add("os", "web")

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

// makeRequest membuat HTTP request dengan headers yang sesuai
func makeRequest(baseURL string, params url.Values) (*http.Response, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Konstruksi URL dengan query parameters
	fullURL := baseURL + "?" + params.Encode()

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return nil, err
	}

	// Set headers untuk meniru browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Referer", "https://gmgn.ai/")
	req.Header.Set("Sec-Fetch-Dest", "empty")
	req.Header.Set("Sec-Fetch-Mode", "cors")
	req.Header.Set("Sec-Fetch-Site", "same-origin")

	return client.Do(req)
}
