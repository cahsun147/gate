package ai

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid format", "details": err.Error()})
		return
	}

	// Teruskan pesan ke Thirdweb API
	originalResponse, err := SendChatToAI(req.Messages)

	if err != nil {
		// Jika error dari Thirdweb (misal 500), tampilkan rawResponse-nya untuk debugging
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":            err.Error(),
			"thirdweb_details": originalResponse,
		})
		return
	}

	// 🚀 OUTPUTKAN JSON ASLI (Sama persis seperti Python Anda)
	c.JSON(http.StatusOK, originalResponse)
}
