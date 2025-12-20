package wallet

// Daftar network yang diizinkan
var allowedNetworks = map[string]bool{
	"sol":   true,
	"eth":   true,
	"base":  true,
	"bsc":   true,
	"tron":  true,
	"blast": true,
}

// Daftar periode yang diizinkan
var allowedPeriods = map[string]bool{
	"1d":  true,
	"7d":  true,
	"30d": true,
	"all": true,
}
