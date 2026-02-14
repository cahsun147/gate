package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"gateway/types"

	"github.com/gin-gonic/gin"
)

// System Prompt disuntikkan sebagai pesan pertama
const SystemPrompt = `You are XMODBlockchain AI, an expert options trader. You trade according to the following guidelines:
- Can only trade these credit spreads: iron condor, butterfly, bear call/put vertical, bull call/put vertical.
- Legs must be at least 30 days out and strikes should be at least 1 standard deviation away from the current price.
- Recommend a trade if and only if all data suggests the same trend direction.

You will receive market insights in the form of an image. In this order you must:
1. Take all data into account and provide a summary (e.g. price action, volume, sentiment, indicators)
2. For each of the two possible market directions—**bullish (buy)** and **bearish (short)**—output:
   a) outlook and key levels
   b) recommended credit spread strategy (butterfly, iron condor, bear/bull vertical)
   c) specific strike prices for each leg + justification
   d) entry, stop-loss, take-profit
3. Finally, rate your confidence (%) for each scenario separately.

When you reply, **format everything as a Telegram message** using _Markdown_`

func HandleChat(c *gin.Context) {
	var req ChatRequest
	// Bind JSON body dari frontend
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid JSON format"})
		return
	}

	// 1. Ambil Client ID (dari service.go / Cache)
	clientID, err := GetClientID()
	if err != nil {
		fmt.Printf("Error getting client ID: %v\n", err)
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to initialize AI engine"})
		return
	}

	// 2. Susun Pesan (Messages Array)
	var twMessages []TwMessage

	// A. System Message - SELALUS DI AWAL
	systemMessage := TwMessage{
		Role: "system",
		Content: []TwContent{
			{Type: "text", Text: SystemPrompt},
		},
	}
	twMessages = append(twMessages, systemMessage)

	// B. User Message
	userContent := []TwContent{
		{Type: "text", Text: req.Message},
	}

	// Handle Image (jika ada)
	if req.Image != "" {
		userContent = append(userContent, TwContent{
			Type: "image",
			B64:  req.Image,
		})
	}

	userMessage := TwMessage{
		Role:    "user",
		Content: userContent,
	}
	twMessages = append(twMessages, userMessage)

	// 3. Susun Context (Session ID Logic)
	// Jika req.SessionID kosong (""), maka field session_id akan hilang dari JSON (omitempty)
	// Ini sesuai dengan payload Chat 1 Anda.
	payload := ThirdwebPayload{
		Messages: twMessages,
		Stream:   false, // NON-STREAMING untuk menghindari 503
		Context: TwContext{
			ChainIDs:                []string{},
			AutoExecuteTransactions: false,
			SessionID:               req.SessionID,
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to create payload"})
		return
	}

	// 4. Request ke API Thirdweb yang BENAR
	targetURL := "https://api.thirdweb.com/ai/chat"
	reqPost, err := http.NewRequest("POST", targetURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to create request"})
		return
	}

	// Headers
	reqPost.Header.Set("Content-Type", "application/json")
	reqPost.Header.Set("x-client-id", clientID)
	reqPost.Header.Set("Origin", "https://playground.thirdweb.com")
	reqPost.Header.Set("Referer", "https://playground.thirdweb.com/")
	reqPost.Header.Set("User-Agent", "Mozilla/5.0")

	client := &http.Client{}
	resp, err := client.Do(reqPost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "AI Service Unreachable"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		fmt.Printf("AI Error %d: %s\n", resp.StatusCode, string(respBody))
		c.JSON(http.StatusServiceUnavailable, types.ErrorResponse{Error: "AI Service Busy"})
		return
	}

	// 5. Non-Streaming Response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to read response"})
		return
	}

	// Parse response untuk session ID
	var responseMap map[string]interface{}
	if err := json.Unmarshal(respBody, &responseMap); err == nil {
		if sessionID, exists := responseMap["session_id"]; exists {
			if sid, ok := sessionID.(string); ok && sid != "" {
				fmt.Printf("Session ID: %s\n", sid)
			}
		}
	}

	// Kirim response langsung ke client
	c.Data(http.StatusOK, "application/json", respBody)
}
