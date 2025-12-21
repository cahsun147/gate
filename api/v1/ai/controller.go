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

Format everything as a Telegram message using Markdown.`

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

	// Logic: Jika ini chat pertama (SessionID kosong), kita suntikkan System Prompt
	// Jika chat kedua (SessionID ada), Thirdweb sudah ingat konteksnya, 
	// tapi aman juga untuk selalu mengirim System Prompt atau digabung dengan user message.
	// Disini kita prepend system prompt ke user message agar hemat token & konteks terjaga.
	
	finalText := req.Message
	if req.SessionID == "" {
		// Inject Persona di awal percakapan
		finalText = SystemPrompt + "\n\n" + req.Message
	}

	userContent := []TwContent{
		{Text: finalText, Type: "text"},
	}

	// Handle Image (jika ada)
	if req.Image != "" {
		userContent = append(userContent, TwContent{
			Type:     "image_url",
			ImageURL: &TwImageURL{URL: req.Image},
		})
	}

	twMessages = append(twMessages, TwMessage{
		Role:    "user",
		Content: userContent,
	})

	// 3. Susun Context (Session ID Logic)
	// Jika req.SessionID kosong (""), maka field session_id akan hilang dari JSON (omitempty)
	// Ini sesuai dengan payload Chat 1 Anda.
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
	reqPost.Header.Set("Accept", "text/event-stream")

	client := &http.Client{}
	resp, err := client.Do(reqPost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.ErrorResponse{Error: "AI Service Unreachable"})
		return
	}
	// Jangan close body disini, kita stream di bawah

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		c.JSON(http.StatusServiceUnavailable, types.ErrorResponse{Error: "AI Service Busy"})
		return
	}

	// 5. Streaming Proxy (SSE)
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	c.Stream(func(w io.Writer) bool {
		scanner := bufio.NewScanner(resp.Body)
		buf := make([]byte, 0, 64*1024)
		scanner.Buffer(buf, 1024*1024)

		var currentEvent string

		for scanner.Scan() {
			line := scanner.Text()

			// Parse Event Name (init, presence, delta)
			if strings.HasPrefix(line, "event:") {
				currentEvent = strings.TrimSpace(strings.TrimPrefix(line, "event:"))
				continue
			}

			// Parse Data Payload
			if strings.HasPrefix(line, "data:") {
				dataStr := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
				if dataStr == "" {
					continue
				}

				// Kita forward MENTAH-MENTAH ke Frontend
				// Supaya frontend bisa baca event: "init" -> ambil session_id
				// dan event: "delta" -> ambil teks jawaban
				fmt.Fprintf(w, "event: %s\n", currentEvent)
				fmt.Fprintf(w, "data: %s\n\n", dataStr)
				
				if f, ok := w.(http.Flusher); ok {
					f.Flush()
				}
			}
		}
		resp.Body.Close()
		return false
	})
}