package wallet

import (
	"net/http"
	"net/url"
	"time"
)

var allowedNetworks = map[string]bool{
	"sol":   true,
	"eth":   true,
	"base":  true,
	"bsc":   true,
	"tron":  true,
	"blast": true,
}

// makeRequest membuat HTTP request dengan headers yang sesuai
func makeRequest(baseURL string, params url.Values) (*http.Response, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Konstruksi URL dengan query parameters
	fullURL := baseURL + "?" + params.Encode()

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return nil, err
	}

	// Set headers untuk meniru browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Referer", "https://gmgn.ai/")
	req.Header.Set("Sec-Fetch-Dest", "empty")
	req.Header.Set("Sec-Fetch-Mode", "cors")
	req.Header.Set("Sec-Fetch-Site", "same-origin")

	return client.Do(req)
}
