import cloudscraper
import json
import time

# Daftar validasi
ALLOWED_NETWORKS = ['sol', 'eth', 'base', 'bsc', 'tron', 'blast']
ALLOWED_PERIODS = ['1d', '7d', '30d', 'all']

def handler(network, wallet_address, period):
    """Menangani permintaan untuk endpoint /api/v1/wallet/statistics."""
    # Validasi parameter
    if network not in ALLOWED_NETWORKS:
        return json.dumps({"error": "Jaringan tidak valid", "message": "success"}), 400
    if period not in ALLOWED_PERIODS:
        return json.dumps({"error": "Period tidak valid", "message": "success"}), 400

    # Konstruksi URL dan params
    url = f"https://gmgn.ai/api/v1/wallet_stat/{network}/{wallet_address}/{period}"
    params = {
        'app_lang': 'en-US',
        'os': 'web',
        'period': period
    }

    # Konfigurasi cloudscraper
    scraper = cloudscraper.create_scraper()

    # Header untuk meniru browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://gmgn.ai/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
    }

    # Batas percobaan dan jeda
    max_retries = 10
    retry_delay = 0  # detik

    for attempt in range(max_retries):
        try:
            response = scraper.get(url, params=params, headers=headers)
            if response.status_code == 200:
                try:
                    api_data = response.json()
                    statistics_data = api_data.get('data', {})
                    new_data = {
                        "made by": "Xdeployments",
                        "message": "ok",
                        "datawallet": {
                            "statistics": statistics_data
                        }
                    }
                    return json.dumps(new_data), 200
                except json.JSONDecodeError:
                    print("Kesalahan penguraian JSON")
                    return json.dumps({"error": "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti."}), 500
            elif response.status_code == 403:
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                else:
                    print("Gagal setelah 3 percobaan karena status 403")
                    return json.dumps({"error": "Server overload, coba lagi nanti", "message": "success ;)"}), 503
            else:
                print(f"Status kode API: {response.status_code}")
                return json.dumps({"error": "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti."}), 500
        except Exception as e:
            print(f"Kesalahan terjadi: {str(e)}")
            return json.dumps({"error": "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti."}), 500

    # Fallback jika semua percobaan gagal
    print("Gagal setelah semua percobaan")
    return json.dumps({"error": "Server overload, coba lagi nanti", "message": "Fail get data OnChain"}), 503