package handler

import (
	"net/http"

	"gateway/cache"
	"gateway/v1/ai"
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
			// AI Route (UBAH DISINI: dari "/ai/chat" menjadi "/chat")
			// Hasil akhir: /api/v1/chat
			v1Group.POST("/chat", ai.HandleChat)

			// Token Routes
			v1Group.GET("/tokens/trends/:network/:contract_address", tokens.GetTrends)
			v1Group.GET("/tokens/holder/:network/:contract_address", tokens.GetHolder)
			v1Group.GET("/tokens/traders/:network/:contract_address", tokens.GetTraders)

			// DEX Routes
			v1Group.GET("/dex", dex.GetDex)
			v1Group.GET("/dex/:network/:address", dex.GetDex)

			// Wallet Routes
			v1Group.GET("/wallet/activity/:network/:address", wallet.GetActivity)
			v1Group.GET("/wallet/holdings/:network/:address", wallet.GetHoldings)
			v1Group.GET("/wallet/flow/:network/:address", wallet.GetFlow)
			v1Group.GET("/wallet/statistics/:network/:address", wallet.GetStatistics)
		}
	}
}

func Handler(w http.ResponseWriter, r *http.Request) {
	router.ServeHTTP(w, r)
}

func handleAPIStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Gateway API is running",
		"version": "1.0.0",
	})
}