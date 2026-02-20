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

const (
	pageURL   = "https://playground.thirdweb.com/ai/chat"
	baseURL   = "https://playground.thirdweb.com"
	apiURL    = "https://api.thirdweb.com/ai/chat"
	userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
)

func getClientId() (string, error) {
	if id, found := clientIdCache.Get("thirdweb_client_id"); found {
		return id.(string), nil
	}

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Get(pageURL)
	if err != nil {
		return "", fmt.Errorf("failed to fetch page: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	reJS := regexp.MustCompile(`/_next/static/chunks/app/ai/chat/page-[^"']+\.js`)
	jsPaths := reJS.FindAllString(string(body), -1)
	if len(jsPaths) == 0 {
		return "", fmt.Errorf("JS file path not found")
	}

	// Deduplikasi path
	uniquePaths := make(map[string]bool)
	for _, p := range jsPaths {
		uniquePaths[p] = true
	}

	patterns := []string{`"x-client-id"\s*:\s*"([a-f0-9]{32})"`, `clientId\s*:\s*"([a-f0-9]{32})"`}

	for path := range uniquePaths {
		reqJS, _ := http.NewRequest("GET", baseURL+path, nil)
		reqJS.Header.Set("User-Agent", userAgent)
		respJS, err := client.Do(reqJS)
		if err != nil {
			continue
		}

		jsBody, _ := io.ReadAll(respJS.Body)
		respJS.Body.Close()

		for _, p := range patterns {
			match := regexp.MustCompile(p).FindStringSubmatch(string(jsBody))
			if len(match) >= 2 {
				clientId := match[1]
				clientIdCache.Set("thirdweb_client_id", clientId, cache.DefaultExpiration)
				return clientId, nil
			}
		}
	}

	return "", fmt.Errorf("client ID not found")
}

func SendChatToAI(messages []Message) (*ChatResponse, error) {
	clientID, err := getClientId()
	if err != nil {
		return nil, fmt.Errorf("auth_init_failed: %v", err)
	}

	payload := ChatPayload{
		Messages: messages,
		Stream:   false,
		Context: ChatContext{
			ChainIds:                []string{},
			AutoExecuteTransactions: false,
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal_error: %v", err)
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("request_creation_failed: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if clientID != "" {
		req.Header.Set("x-client-id", clientID)
	}
	req.Header.Set("User-Agent", userAgent)
	req.Header.Set("Origin", baseURL)
	req.Header.Set("Referer", pageURL)

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("connection_failed: %v", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read_body_failed: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api_error_%d: %s", resp.StatusCode, string(bodyBytes))
	}

	var chatResp ChatResponse
	if err := json.Unmarshal(bodyBytes, &chatResp); err != nil {
		return nil, fmt.Errorf("decode_error: %v | body: %s", err, string(bodyBytes))
	}

	return &chatResp, nil
}
