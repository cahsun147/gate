package wallet

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

// GetActivity menangani permintaan untuk endpoint /api/v1/wallet/activity/:network/:address
func GetActivity(c *gin.Context) {
	network := c.Param("network")
	walletAddress := c.Param("address")
	limitStr := c.Query("limit")

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

	if limit < 1 || limit > 200 {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{
			Error:   "Batas harus antara 1 dan 200",
			Message: "success",
		})
		return
	}

	// Konstruksi URL dan params
	baseURL := fmt.Sprintf("https://gmgn.ai/api/v1/wallet_activity/%s", network)
	params := url.Values{}
	params.Add("type", "buy")
	params.Add("type", "sell")
	params.Add("type", "transferIn")
	params.Add("type", "transferOut")
	params.Add("type", "add")
	params.Add("type", "remove")
	params.Add("app_lang", "en-US")
	params.Add("os", "web")
	params.Add("wallet", walletAddress)
	params.Add("limit", strconv.Itoa(limit))
	params.Add("cost", "10")

	// Cek cache terlebih dahulu
	cacheKey := fmt.Sprintf("wallet:activity:%s:%s:%s", network, walletAddress, limitStr)
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

			// Extract activities dan next dari response
			activities := []interface{}{}
			nextPage := interface{}(nil)
			if dataMap, ok := apiData["data"].(map[string]interface{}); ok {
				if activitiesData, ok := dataMap["activities"]; ok {
					activities = activitiesData.([]interface{})
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
						"activitylist": activities,
						"next":         nextPage,
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
