package ai

// Input dari Frontend
type ChatRequest struct {
	Message   string `json:"message"`
	Image     string `json:"image,omitempty"`      // Base64
	SessionID string `json:"session_id,omitempty"` // Opsional (kosong saat chat pertama)
}

// Payload ke Thirdweb (Sesuai Log Asli)
type ThirdwebPayload struct {
	Messages []TwMessage `json:"messages"`
	Stream   bool        `json:"stream"`
	Context  TwContext   `json:"context"`
}

type TwMessage struct {
	Content []TwContent `json:"content"`
	Role    string      `json:"role"`
}

type TwContent struct {
	Text     string      `json:"text,omitempty"`
	Type     string      `json:"type"` // "text" atau "image_url"
	ImageURL *TwImageURL `json:"image_url,omitempty"`
}

type TwImageURL struct {
	URL string `json:"url"`
}

type TwContext struct {
	ChainIDs                []string `json:"chain_ids"`
	AutoExecuteTransactions bool     `json:"auto_execute_transactions"`
	// PENTING: omitempty agar field ini HILANG jika string kosong ""
	SessionID string `json:"session_id,omitempty"`
}
