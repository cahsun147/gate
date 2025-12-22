package ai

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"gateway/types"

	"github.com/gin-gonic/gin"
)

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

Format everything as a Telegram message using Markdown.`

func HandleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid JSON format"})
		return
	}

	clientID, err := GetClientID()
	if err != nil {
		fmt.Printf("Error getting client ID: %v\n", err)
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to initialize AI engine"})
		return
	}

	var twMessages []TwMessage
	finalText := SystemPrompt + "\n\nUser Query: " + req.Message

	// Struktur konten pesan
	userContent := []TwContent{
		{Text: finalText, Type: "text"},
	}

	if req.Image != "" {
		userContent = append(userContent, TwContent{
			// PERBAIKAN 1: Ganti "image_url" menjadi "image" agar diterima Thirdweb
			Type:     "image",
			ImageURL: &TwImageURL{URL: req.Image},
		})
	}

	twMessages = append(twMessages, TwMessage{
		Role:    "user",
		Content: userContent,
	})

	payload := ThirdwebPayload{
		Messages: twMessages,
		Stream:   true,
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

	targetURL := "https://api.thirdweb.com/ai/chat"
	reqPost, err := http.NewRequest("POST", targetURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "Failed to create request"})
		return
	}

	reqPost.Header.Set("Content-Type", "application/json")
	reqPost.Header.Set("x-client-id", clientID)
	reqPost.Header.Set("Origin", "https://playground.thirdweb.com")
	reqPost.Header.Set("Referer", "https://playground.thirdweb.com/")
	reqPost.Header.Set("User-Agent", "Mozilla/5.0")
	reqPost.Header.Set("Accept", "text/event-stream")

	client := &http.Client{}
	resp, err := client.Do(reqPost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "AI Service Unreachable"})
		return
	}
	// Jangan close body, kita baca stream
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		fmt.Printf("AI Error: %d Body: %s\n", resp.StatusCode, string(respBody))
		c.JSON(http.StatusServiceUnavailable, types.ErrorResponse{Error: "AI Service Busy"})
		return
	}

	// PERBAIKAN 2: Hapus c.Stream(), gunakan manual write agar tidak Panic di Vercel
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")

	// Cek apakah server mendukung Flush (Vercel Serverless mungkin tidak, tapi kita handle amannya)
	flusher, hasFlush := c.Writer.(http.Flusher)
	if hasFlush {
		flusher.Flush()
	}

	scanner := bufio.NewScanner(resp.Body)
	buf := make([]byte, 0, 64*1024)
	scanner.Buffer(buf, 1024*1024)

	var currentEvent string

	for scanner.Scan() {
		line := scanner.Text()

		if strings.HasPrefix(line, "event:") {
			currentEvent = strings.TrimSpace(strings.TrimPrefix(line, "event:"))
			continue
		}

		if strings.HasPrefix(line, "data:") {
			dataStr := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
			if dataStr == "" {
				continue
			}

			// Tulis langsung ke output writer
			fmt.Fprintf(c.Writer, "event: %s\n", currentEvent)
			fmt.Fprintf(c.Writer, "data: %s\n\n", dataStr)

			// Lakukan flush jika didukung agar efek mengetik muncul
			if hasFlush {
				flusher.Flush()
			}
		}
	}
}
