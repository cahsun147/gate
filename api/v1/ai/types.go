package ai

type Message struct {
	Role    string      `json:"role"`
	Content interface{} `json:"content"`
}

type ChatRequest struct {
	Messages []Message `json:"messages"`
}