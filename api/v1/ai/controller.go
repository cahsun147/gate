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

// Struct Payload dinamis untuk menangani "Content" yang bisa String atau Array
type ThirdwebDynamicPayload struct {
	Messages []DynamicMessage `json:"messages"`
	Stream   bool             `json:"stream"`
	Context  TwContext        `json:"context"`
}

type DynamicMessage struct {
	Role    string      `json:"role"`
	Content interface{} `json:"content"` // Bisa String atau []TwContent
}

// Struct khusus untuk item dalam array content (jika multimodal)
type TwContentItem struct {
	Type     string `json:"type"`                // "text" atau "image"
	Text     string `json:"text,omitempty"`      // Jika type=text
	ImageURL string `json:"image_url,omitempty"` // Jika type=image (String, bukan Object)
}

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

	// --- 1. LOGIC SMART PAYLOAD ---
	var finalMessages []DynamicMessage

	finalText := SystemPrompt + "\n\nUser Query: " + req.Message

	if req.Image == "" {
		// KASUS 1: TEXT ONLY -> Kirim Content sebagai STRING (Fix Error 400 ZodError)
		finalMessages = append(finalMessages, DynamicMessage{
			Role:    "user",
			Content: finalText,
		})
	} else {
		// KASUS 2: GAMBAR + TEXT -> Kirim Content sebagai ARRAY
		contentArray := []TwContentItem{
			{
				Type: "text",
				Text: finalText,
			},
			{
				Type:     "image",   // Fix: Gunakan "image", bukan "image_url"
				ImageURL: req.Image, // Fix: Langsung string base64, bukan object
			},
		}
		finalMessages = append(finalMessages, DynamicMessage{
			Role:    "user",
			Content: contentArray,
		})
	}

	payload := ThirdwebDynamicPayload{
		Messages: finalMessages,
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

	// --- 2. REQUEST KE THIRDWEB ---
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
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		fmt.Printf("AI Error: %d Body: %s\n", resp.StatusCode, string(respBody))
		c.JSON(http.StatusServiceUnavailable, types.ErrorResponse{Error: "AI Service Busy"})
		return
	}

	// --- 3. MANUAL STREAMING (VERCEL SAFE - NO FLUSH) ---
	// Kita set header manual
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	// Di Vercel Serverless, Transfer-Encoding: chunked dihandle otomatis oleh platform

	// Scanner untuk membaca respons baris per baris
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

			// Tulis langsung ke ResponseWriter
			// PENTING: Kita TIDAK memanggil Flush() karena Vercel tidak mendukungnya.
			// Data akan dikirim oleh Vercel secepat mungkin (streaming atau buffered).
			fmt.Fprintf(c.Writer, "event: %s\n", currentEvent)
			fmt.Fprintf(c.Writer, "data: %s\n\n", dataStr)
		}
	}

	// Tidak perlu return value, stream selesai.
}
