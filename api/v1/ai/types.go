package ai

type Message struct {
	Role string `json:"role"`
	// Menggunakan interface{} agar bisa menerima Teks (String)
	// ATAU Array berisi gambar/teks untuk keperluan Multimodal (Kirim Gambar)
	Content interface{} `json:"content"`
}

type ChatRequest struct {
	Messages []Message `json:"messages"`
	Stream   bool      `json:"stream"`
}
