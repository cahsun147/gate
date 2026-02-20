package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"time"

	"github.com/patrickmn/go-cache"
)

var clientIdCache = cache.New(5*time.Hour, 10*time.Hour)

func getClientId() (string, error) {
	if id, found := clientIdCache.Get("thirdweb_client_id"); found {
		return id.(string), nil
	}

	client := &http.Client{Timeout: 15 * time.Second}
	req, _ := http.NewRequest("GET", "https://playground.thirdweb.com/ai/chat", nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	resp, err := client.Do(req)
	if err != nil { return "", err }
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	reJS := regexp.MustCompile(`/_next/static/chunks/app/ai/chat/page-[^"']+\.js`)
	jsFile := reJS.FindString(string(body))
	if jsFile == "" { return "", fmt.Errorf("JS file path not found") }

	reqJS, _ := http.NewRequest("GET", "https://playground.thirdweb.com"+jsFile, nil)
	reqJS.Header.Set("User-Agent", "Mozilla/5.0")
	respJS, err := client.Do(reqJS)
	if err != nil { return "", err }
	defer respJS.Body.Close()

	jsBody, _ := io.ReadAll(respJS.Body)
	// Cari ID dengan berbagai pola regex
	patterns := []string{`"x-client-id"\s*:\s*"([a-f0-9]{32})"`, `clientId\s*:\s*"([a-f0-9]{32})"`}
	for _, p := range patterns {
		match := regexp.MustCompile(p).FindStringSubmatch(string(jsBody))
		if len(match) >= 2 {
			clientId := match[1]
			clientIdCache.Set("thirdweb_client_id", clientId, cache.DefaultExpiration)
			return clientId, nil
		}
	}
	return "", fmt.Errorf("Client ID not found in JS content")
}

func SendChatToAI(messages []Message) (map[string]interface{}, error) {
	clientID, err := getClientId()
	if err != nil { return nil, fmt.Errorf("auth_init_failed: %v", err) }

	// 1. AUTO-FIX FORMAT: Ubah string biasa jadi Array Object jika diperlukan
	for i, msg := range messages {
		if str, ok := msg.Content.(string); ok {
			messages[i].Content = []map[string]string{{"type": "text", "text": str}}
		}
	}

	// 2. CONSTRUCT PAYLOAD (Sesuai Postman/Python yang berhasil)
	payload := map[string]interface{}{
		"messages": messages,
		"stream":   false,
	}

	jsonData, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "https://playground.thirdweb.com/api/chat", bytes.NewBuffer(jsonData))

	// 3. SET BROWSER HEADERS (Kritikal agar tidak Error 500)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-client-id", clientID)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Origin", "https://playground.thirdweb.com")
	req.Header.Set("Referer", "https://playground.thirdweb.com/ai/chat")
	req.Header.Set("Accept", "*/*")

	// Set Timeout cukup lama (60s) karena stream: false memproses semuanya di server
	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil { return nil, fmt.Errorf("connection_failed: %v", err) }
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	// Jika status bukan 200, kembalikan body mentah sebagai info debugging
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Thirdweb API Error %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var rawResponse map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &rawResponse); err != nil {
		return nil, fmt.Errorf("json_decode_failed: %v", err)
	}

	return rawResponse, nil
}