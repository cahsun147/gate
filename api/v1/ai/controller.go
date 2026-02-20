package ai

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request_format",
			"details": err.Error(),
		})
		return
	}

	// Panggil service
	result, err := SendChatToAI(req.Messages)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Kembalikan response dari thirdweb langsung
	c.JSON(http.StatusOK, result)
}
