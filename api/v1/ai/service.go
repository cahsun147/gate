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

func getClientId() (string, error) {
	if id, found := clientIdCache.Get("thirdweb_client_id"); found {
		return id.(string), nil
	}

	httpClient := &http.Client{Timeout: 10 * time.Second}

	reqPage, _ := http.NewRequest("GET", "https://playground.thirdweb.com/ai/chat", nil)
	reqPage.Header.Set("User-Agent", "Mozilla/5.0")
	respPage, err := httpClient.Do(reqPage)
	if err != nil {
		return "", err
	}
	defer respPage.Body.Close()

	body, _ := io.ReadAll(respPage.Body)
	reJS := regexp.MustCompile(`/_next/static/chunks/app/ai/chat/page-[^"']+\.js`)
	jsFile := reJS.FindString(string(body))
	if jsFile == "" {
		return "", fmt.Errorf("JS file not found")
	}

	reqJS, _ := http.NewRequest("GET", "https://playground.thirdweb.com"+jsFile, nil)
	reqJS.Header.Set("User-Agent", "Mozilla/5.0")
	respJS, err := httpClient.Do(reqJS)
	if err != nil {
		return "", err
	}
	defer respJS.Body.Close()

	jsBody, _ := io.ReadAll(respJS.Body)
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

// Kita kembalikan map interface{} agar struktur JSON "ASLI" dari Thirdweb tidak hilang
func SendChatToAI(messages []Message) (map[string]interface{}, error) {
	clientID, err := getClientId()
	if err != nil {
		fmt.Println("Warning: Could not scrape Client ID:", err)
	}

	// Payload mirip dengan yang di ainostream.py
	payload := map[string]interface{}{
		"messages": messages,
		"stream":   false, // Gunakan FALSE karena API Asli mendukungnya jika format benar
		"context": map[string]interface{}{
			"chain_ids":                 []string{},
			"auto_execute_transactions": false,
		},
	}

	jsonData, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "https://playground.thirdweb.com/api/chat", bytes.NewBuffer(jsonData))

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36")
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

	// Parse secara dinamis respons ASLI (message, session_id, dll)
	var rawResponse map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rawResponse); err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	if resp.StatusCode != 200 {
		return rawResponse, fmt.Errorf("API Error %d", resp.StatusCode)
	}

	return rawResponse, nil
}
