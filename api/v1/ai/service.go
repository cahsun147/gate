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

var clientIdCache = cache.New(1*time.Hour, 2*time.Hour)

// getClientId melakukan scraping untuk mendapatkan ID Thirdweb (PENTING)
func getClientId() (string, error) {
	if id, found := clientIdCache.Get("thirdweb_client_id"); found {
		return id.(string), nil
	}

	resp, err := http.Get("https://playground.thirdweb.com/ai/chat")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	reJS := regexp.MustCompile(`/_next/static/chunks/app/ai/chat/page-[^"']+\.js`)
	jsFile := reJS.FindString(string(body))
	if jsFile == "" {
		return "", fmt.Errorf("JS file not found")
	}

	jsResp, err := http.Get("https://playground.thirdweb.com" + jsFile)
	if err != nil {
		return "", err
	}
	defer jsResp.Body.Close()

	jsBody, err := io.ReadAll(jsResp.Body)
	if err != nil {
		return "", err
	}

	reID := regexp.MustCompile(`clientId\s*:\s*"([a-f0-9]{32})"`)
	match := reID.FindStringSubmatch(string(jsBody))
	
	if len(match) < 2 {
		reIDAlt := regexp.MustCompile(`"x-client-id"\s*:\s*"([a-f0-9]{32})"`)
		match = reIDAlt.FindStringSubmatch(string(jsBody))
	}

	if len(match) >= 2 {
		clientId := match[1]
		clientIdCache.Set("thirdweb_client_id", clientId, cache.DefaultExpiration)
		return clientId, nil
	}

	return "", fmt.Errorf("Client ID not found")
}

// SendChatToAI mengirim pesan ke Thirdweb TANPA Streaming
func SendChatToAI(messages []Message) (*ChatResponse, error) {
	clientID, err := getClientId()
	if err != nil {
		fmt.Println("Warning: Could not scrape Client ID:", err)
	}

	contextData := map[string]interface{}{
		"chain_ids":                 []string{},
		"auto_execute_transactions": false,
	}

	payload := map[string]interface{}{
		"messages": messages,
		"stream":   false, // <--- DIUBAH JADI FALSE
		"context":  contextData,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", "https://playground.thirdweb.com/api/chat", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0")
	req.Header.Set("Origin", "https://playground.thirdweb.com")
	req.Header.Set("Referer", "https://playground.thirdweb.com/")
	
	if clientID != "" {
		req.Header.Set("x-client-id", clientID)
	}

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI Provider error status: %d", resp.StatusCode)
	}

	// Decode langsung ke struct ChatResponse
	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &chatResp, nil
}