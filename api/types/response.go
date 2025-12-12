package types

// StandardResponse adalah format respons standar untuk semua endpoint
type StandardResponse struct {
	MadeBy  string      `json:"made by"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// TrendsData adalah struktur data untuk endpoint trends
type TrendsData struct {
	ChartTrends interface{} `json:"chartTrends"`
}

// ErrorResponse adalah format respons untuk error
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}
