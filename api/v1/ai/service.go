package ai

import (
	"fmt"
	"io"
	"net/http"
	"regexp"
	"time"

	"gateway/cache" // Pastikan import ini sesuai module Anda
)

const (
	PlaygroundURL = "https://playground.thirdweb.com/ai/chat"
	BaseURL       = "https://playground.thirdweb.com"
	CacheKey      = "thirdweb:client_id"
)

// GetClientID mengambil Client ID dari Cache atau Scrape ulang dari web
func GetClientID() (string, error) {
	// 1. Cek Redis Cache dulu
	if cachedID, err := cache.GetCache(CacheKey); err == nil && cachedID != nil {
		if idStr, ok := cachedID.(string); ok && idStr != "" {
			return idStr, nil
		}
	}

	fmt.Println("🔄 Client ID not in cache, scraping...")

	// 2. Buat HTTP client standar
	client := &http.Client{Timeout: 10 * time.Second}

	// 3. Fetch Halaman Utama untuk cari file JS
	req, err := http.NewRequest("GET", PlaygroundURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request for playground: %v", err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to fetch playground: %v", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read playground body: %v", err)
	}
	htmlContent := string(bodyBytes)

	// 4. Cari Path File JS (Regex)
	// Python: r"/_next/static/chunks/app/ai/chat/page-[^\"']+\.js"
	jsFileRegex := regexp.MustCompile(`/_next/static/chunks/app/ai/chat/page-[^"']+\.js`)
	jsPath := jsFileRegex.FindString(htmlContent)

	if jsPath == "" {
		return "", fmt.Errorf("failed to find JS file path in HTML")
	}

	// 5. Fetch File JS tersebut
	jsURL := BaseURL + jsPath
	reqJS, err := http.NewRequest("GET", jsURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request for JS file: %v", err)
	}
	reqJS.Header.Set("User-Agent", "Mozilla/5.0")

	respJS, err := client.Do(reqJS)
	if err != nil {
		return "", fmt.Errorf("failed to fetch JS file: %v", err)
	}
	defer respJS.Body.Close()

	jsBodyBytes, err := io.ReadAll(respJS.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read JS body: %v", err)
	}
	jsContent := string(jsBodyBytes)

	// 6. Extract Client ID dari konten JS
	// Pattern 1: "x-client-id":"..."
	idRegex := regexp.MustCompile(`"x-client-id"\s*:\s*"([a-f0-9]{32})"`)
	matches := idRegex.FindStringSubmatch(jsContent)

	if len(matches) < 2 {
		// Pattern 2 (Fallback): clientId:"..."
		idRegex2 := regexp.MustCompile(`clientId\s*:\s*"([a-f0-9]{32})"`)
		matches = idRegex2.FindStringSubmatch(jsContent)
		if len(matches) < 2 {
			return "", fmt.Errorf("failed to regex match client ID in JS file")
		}
	}

	clientID := matches[1]
	fmt.Printf("✅ Found Client ID: %s\n", clientID)

	// 7. Simpan ke Redis (Cache selama 1 Jam)
	// Pastikan fungsi cache.SetCache di project Anda mendukung parameter ini
	_ = cache.SetCache(CacheKey, clientID, 1*time.Hour)

	return clientID, nil
}