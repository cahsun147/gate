package main

import (
	"net/http"

	"gateway/cache"
	"gateway/v1/dex"
	"gateway/v1/tokens"
	"gateway/v1/wallet"

	"github.com/gin-gonic/gin"
)

var router *gin.Engine

func init() {
	// Inisialisasi Redis client
	cache.InitRedis()

	router = gin.Default()

	// Setup routing groups
	apiGroup := router.Group("/api")
	{
		// Dummy handler untuk /api
		apiGroup.GET("", handleAPIStatus)
		apiGroup.GET("/", handleAPIStatus)

		// Setup /api/v1 group
		v1Group := apiGroup.Group("/v1")
		{
			// Tokens routes
			v1Group.GET("/tokens/trends/:network/:contract_address", tokens.GetTrends)
			v1Group.GET("/tokens/holder/:network/:contract_address", tokens.GetHolder)
			v1Group.GET("/tokens/traders/:network/:contract_address", tokens.GetTraders)

			// DEX routes
			v1Group.GET("/dex/:network/:address", dex.GetDex)

			// Wallet routes
			v1Group.GET("/wallet/activity/:network/:address", wallet.GetActivity)
			v1Group.GET("/wallet/holdings/:network/:address", wallet.GetHoldings)
			v1Group.GET("/wallet/flow/:network/:address", wallet.GetFlow)
			v1Group.GET("/wallet/statistics/:network/:address", wallet.GetStatistics)
		}
	}
}

// Handler adalah entry point untuk Vercel Serverless
func Handler(w http.ResponseWriter, r *http.Request) {
	router.ServeHTTP(w, r)
}

// handleAPIStatus mengembalikan status alive
func handleAPIStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "alive",
	})
}

func main() {
	defer cache.CloseRedis()
	router.Run(":8080")
}
