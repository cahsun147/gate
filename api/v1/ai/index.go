package ai

import "github.com/gin-gonic/gin"

// RegisterRoutes mendaftarkan semua endpoint AI ke router Gin
func RegisterRoutes(router *gin.RouterGroup) {
	aiGroup := router.Group("/ai")
	{
		aiGroup.POST("/chat", HandleChat)
	}
}
