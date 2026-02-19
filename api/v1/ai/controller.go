package ai

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Dapatkan text utuh dari Service yang sudah di-buffer
	responseText, err := SendChatToAI(req.Messages)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to AI provider: " + err.Error()})
		return
	}

	// Kirim JSON rapi (Non-streaming) ke Bot/Python Anda
	c.JSON(http.StatusOK, gin.H{
		"id": "chatcmpl-gate",
		"choices": []gin.H{
			{
				"message": gin.H{
					"role":    "assistant",
					"content": responseText,
				},
			},
		},
	})
}
