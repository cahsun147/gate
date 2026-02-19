package ai

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/patrickmn/go-cache"
)

var clientIdCache = cache.New(1*time.Hour, 2*time.Hour)

func getClientId() (string, error) {
	if id, found := clientIdCache.Get("thirdweb_client_id"); found {
		return id.(string), nil
	}

	httpClient := &http.Client{Timeout: 10 * time.Second}

	// 1. Scraping Page
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

	// 2. Scraping JS
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

// Berubah mengembalikan string, BUKAN *ChatResponse
func SendChatToAI(messages []Message) (string, error) {
	clientID, err := getClientId()
	if err != nil {
		fmt.Println("Warning: Could not scrape Client ID:", err)
		return "", err
	}

	payload := map[string]interface{}{
		"messages": messages,
		"stream":   true, // <-- WAJIB TRUE AGAR THIRDWEB TIDAK ERROR 500
		"context":  map[string]interface{}{"chain_ids": []string{}, "auto_execute_transactions": false},
	}

	jsonData, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "https://playground.thirdweb.com/api/chat", bytes.NewBuffer(jsonData))

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
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("AI Provider error status: %d", resp.StatusCode)
	}

	// BUFFERING: Mengumpulkan potongan Stream menjadi satu text utuh
	var fullResponse strings.Builder
	scanner := bufio.NewScanner(resp.Body)

	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data:") {
			jsonStr := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
			if jsonStr == "" || jsonStr == "[DONE]" {
				continue
			}

			var data struct {
				V string `json:"v"`
			}
			if err := json.Unmarshal([]byte(jsonStr), &data); err == nil {
				fullResponse.WriteString(data.V)
			}
		}
	}

	return fullResponse.String(), nil
}
