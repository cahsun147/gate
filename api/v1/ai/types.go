package ai

// ContentItem untuk message content (text atau image)
type ContentItem struct {
	Type string `json:"type"`
	Text string `json:"text,omitempty"`
	B64  string `json:"b64,omitempty"`
}

// Message untuk chat messages
type Message struct {
	Role    string      `json:"role"`
	Content interface{} `json:"content"`
}

// ChatRequest dari client
type ChatRequest struct {
	Messages []Message `json:"messages"`
}

// ChatResponse dari thirdweb API (non-streaming)
type ChatResponse struct {
	Message    string   `json:"message"`
	Actions    []string `json:"actions"`
	SessionID  string   `json:"session_id"`
	RequestID  string   `json:"request_id"`
}

// ChatContext untuk payload context
type ChatContext struct {
	ChainIds              []string `json:"chain_ids"`
	AutoExecuteTransactions bool     `json:"auto_execute_transactions"`
}

// ChatPayload untuk request ke thirdweb
type ChatPayload struct {
	Messages []Message   `json:"messages"`
	Stream   bool        `json:"stream"`
	Context  ChatContext `json:"context"`
}