package ai

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Messages []Message `json:"messages"`
	Stream   bool      `json:"stream"`
}

// Struktur Response JSON dari Thirdweb (Non-Stream)
type ChatResponse struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created int64    `json:"created"`
	Choices []Choice `json:"choices"`
}

type Choice struct {
	Index        int     `json:"index"`
	Message      Message `json:"message"` // Perhatikan ini 'Message', bukan 'Delta'
	FinishReason string  `json:"finish_reason"`
}
