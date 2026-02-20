package ai

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request_format", "details": err.Error()})
		return
	}

	// Memanggil service
	result, err := SendChatToAI(req.Messages)

	if err != nil {
		// Menampilkan error dengan detail asli dari Thirdweb jika ada
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":            err.Error(),
			"thirdweb_details": result,
		})
		return
	}

	// Outputkan persis aslinya
	c.JSON(http.StatusOK, result)
}
