package wallet

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

var allowedPeriods = map[string]bool{
	"1d":  true,
	"7d":  true,
	"30d": true,
	"all": true,
}

// GetStatistics menangani permintaan untuk endpoint /api/v1/wallet/statistics/:network/:address
func GetStatistics(c *gin.Context) {
	network := c.Param("network")
	walletAddress := c.Param("address")
	period := c.Query("period")

	// Validasi parameter
	if !allowedNetworks[network] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Jaringan tidak valid",
			Message: "success",
		})
		return
	}

	if !allowedPeriods[period] {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Period tidak valid",
			Message: "success",
		})
		return
	}

	// Cek cache terlebih dahulu
	cacheKey := fmt.Sprintf("wallet:statistics:%s:%s:%s", network, walletAddress, period)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		fmt.Printf("Cache HIT untuk key: %s\n", cacheKey)
		c.JSON(http.StatusOK, cachedData)
		return
	}

	// Konstruksi URL dan params
	baseURL := fmt.Sprintf("https://gmgn.ai/api/v1/wallet_stat/%s/%s/%s", network, walletAddress, period)
	params := url.Values{}
	params.Add("app_lang", "en-US")
	params.Add("os", "web")
	params.Add("period", period)

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

			// Extract statistics data
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
