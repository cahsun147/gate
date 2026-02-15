package ai

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HandleChat menangani chat (Non-Streaming)
func HandleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Panggil service (SendChatToAI)
	resp, err := SendChatToAI(req.Messages)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to AI provider: " + err.Error()})
		return
	}

	// Kembalikan Response JSON utuh
	c.JSON(http.StatusOK, resp)
}