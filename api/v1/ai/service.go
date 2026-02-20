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
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	reJS := regexp.MustCompile(`/_next/static/chunks/app/ai/chat/page-[^"']+\.js`)
	jsFile := reJS.FindString(string(body))
	if jsFile == "" {
		return "", fmt.Errorf("JS file path not found")
	}

	reqJS, _ := http.NewRequest("GET", "https://playground.thirdweb.com"+jsFile, nil)
	reqJS.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
	respJS, err := client.Do(reqJS)
	if err != nil {
		return "", err
	}
	defer respJS.Body.Close()

	jsBody, _ := io.ReadAll(respJS.Body)
	patterns := []string{`"x-client-id"\s*:\s*"([a-f0-9]{32})"`, `clientId\s*:\s*"([a-f0-9]{32})"`}
	for _, p := range patterns {
		match := regexp.MustCompile(p).FindStringSubmatch(string(jsBody))
		if len(match) >= 2 {
			clientId := match[1]
			clientIdCache.Set("thirdweb_client_id", clientId, cache.DefaultExpiration)
			return clientId, nil
		}
	}
	return "", fmt.Errorf("Client ID not found")
}

func SendChatToAI(messages []Message) (map[string]interface{}, error) {
	clientID, err := getClientId()
	if err != nil {
		return nil, fmt.Errorf("auth_init_failed: %v", err)
	}

	// PAYLOAD SEMPURNA: Sama persis dengan test Python Anda
	payload := map[string]interface{}{
		"messages": messages,
		"stream":   false,
		"context": map[string]interface{}{ // <-- INI YANG BIKIN THIRDWEB ERROR 500 KEMARIN KARENA HILANG
			"chain_ids":                 []string{},
			"auto_execute_transactions": false,
		},
	}

	jsonData, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "https://playground.thirdweb.com/api/chat", bytes.NewBuffer(jsonData))

	req.Header.Set("Content-Type", "application/json")
	if clientID != "" {
		req.Header.Set("x-client-id", clientID)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
	req.Header.Set("Origin", "https://playground.thirdweb.com")
	req.Header.Set("Referer", "https://playground.thirdweb.com/ai/chat")

	// Timeout panjang karena AI butuh waktu ngetik di server sana
	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("connection_failed: %v", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	// Proses Body JSON
	var rawResponse map[string]interface{}
	if len(bodyBytes) > 0 {
		if err := json.Unmarshal(bodyBytes, &rawResponse); err != nil {
			return nil, fmt.Errorf("Thirdweb API Error %d: %s", resp.StatusCode, string(bodyBytes))
		}
	}

	// Jika status bukan 200, kembalikan JSON error dari Thirdweb
	if resp.StatusCode != http.StatusOK {
		return rawResponse, fmt.Errorf("API Error %d", resp.StatusCode)
	}

	return rawResponse, nil
}
