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

// GetFlow menangani permintaan untuk endpoint /api/v1/wallet/flow/:network/:address
func GetFlow(c *gin.Context) {
	network := c.Param("network")
	walletAddress := c.Param("address")
	limitStr := c.Query("limit")
	orderBy := c.Query("orderby")
	direction := c.Query("direction")

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
			Error:   "Batas harus antara 1 dan 50",
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

	// Cek cache terlebih dahulu
	cacheKey := fmt.Sprintf("wallet:flow:%s:%s:%s:%s:%s", network, walletAddress, limitStr, orderBy, direction)
	if cachedData, err := cache.GetCache(cacheKey); err == nil && cachedData != nil {
		fmt.Printf("Cache HIT untuk key: %s\n", cacheKey)
		c.JSON(http.StatusOK, cachedData)
		return
	}

	// Konstruksi URL
	baseURL := fmt.Sprintf("https://gmgn.ai/api/v1/wallet_holdings/%s/%s", network, walletAddress)
	params := url.Values{}
	params.Add("app_lang", "en-US")
	params.Add("os", "web")
	params.Add("limit", strconv.Itoa(limit))
	params.Add("orderby", orderBy)
	params.Add("direction", direction)
	params.Add("showsmall", "true")
	params.Add("sellout", "true")
	params.Add("tx30d", "true")

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

			// Extract flows dan next dari response
			flows := []interface{}{}
			nextPage := interface{}(nil)
			if dataMap, ok := apiData["data"].(map[string]interface{}); ok {
				if holdingsData, ok := dataMap["holdings"]; ok {
					flows = holdingsData.([]interface{})
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
						"flowlist": flows,
						"next":     nextPage,
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
