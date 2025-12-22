package ai

// --- Input dari Frontend ---
type ChatRequest struct {
	Message   string `json:"message"`
	Image     string `json:"image,omitempty"` // Base64 string
	SessionID string `json:"session_id,omitempty"`
}

// --- Payload ke Thirdweb (Format N8N) ---
type ThirdwebPayload struct {
	Messages []TwMessage `json:"messages"`
	Stream   bool        `json:"stream"`
	Context  TwContext   `json:"context"`
}

type TwMessage struct {
	Role    string          `json:"role"`    // "system" atau "user"
	Content []TwContentItem `json:"content"` // Wajib Array
}

type TwContentItem struct {
	Type string `json:"type"`           // "text" atau "image"
	Text string `json:"text,omitempty"` // Jika type="text"
	B64  string `json:"b64,omitempty"`  // Jika type="image" (Gunakan 'b64' bukan 'image_url')
}

type TwContext struct {
	ChainIDs                []string `json:"chain_ids"`
	AutoExecuteTransactions bool     `json:"auto_execute_transactions"`
	SessionID               string   `json:"session_id,omitempty"`
}

// --- Helper untuk Parsing Image URL jika diperlukan di tempat lain ---
type TwImageURL struct {
	URL string `json:"url"`
}
