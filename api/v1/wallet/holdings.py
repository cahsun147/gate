import cloudscraper
import json
import time

# Daftar validasi
ALLOWED_NETWORKS = ['sol', 'eth', 'base', 'bsc', 'tron', 'blast']
ALLOWED_ORDERBY = ['last_active_timestamp', 'unrealized_profit', 'realized_profit', 'total_profit', 'usd_value', 'history_bought_cost', 'history_sold_income']
DIRECTIONS = ['asc', 'desc']
ALLOWED_FILTER = ['true', 'false']

def handler(network, wallet_address, limit, orderby, direction, showsmall, sellout, hide_abnormal):
    """Menangani permintaan untuk endpoint /api/v1/wallet/holdings."""
    # Validasi parameter
    if network not in ALLOWED_NETWORKS:
        return json.dumps({"error": "Jaringan tidak valid", "message": "success"}), 400
    try:
        limit = int(limit)
        if limit < 1 or limit > 50:
            return json.dumps({"error": "Batas harus antara 1 - 50", "message": "success"}), 400
    except ValueError:
        return json.dumps({"error": "Batas harus berupa bilangan bulat", "message": "success"}), 400
    if orderby not in ALLOWED_ORDERBY:
        return json.dumps({"error": "Urutan tidak valid", "message": "success"}), 400
    if direction not in DIRECTIONS:
        return json.dumps({"error": "Arah tidak valid", "message": "success"}), 400
    if showsmall not in ALLOWED_FILTER:
        return json.dumps({"error": "Filter showsmall tidak valid", "message": "success"}), 400
    if sellout not in ALLOWED_FILTER:
        return json.dumps({"error": "Filter sellout tidak valid", "message": "success"}), 400
    if hide_abnormal not in ALLOWED_FILTER:
        return json.dumps({"error": "Filter hide_abnormal tidak valid", "message": "success"}), 400

    # Konstruksi URL
    url = f"https://gmgn.ai/api/v1/wallet_holdings/{network}/{wallet_address}"
    params = {
        'os': 'web',
        'limit': limit,
        'orderby': orderby,
        'direction': direction,
        'showsmall': showsmall,
        'sellout': sellout,
        'hide_abnormal': hide_abnormal
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
                    # Ekstrak holdings dan next
                    holdings = api_data.get('data', {}).get('holdings', [])
                    next_page = api_data.get('data', {}).get('next', None)
                    # Buat struktur data baru
                    new_data = {
                        "made by": "Xdeployments",
                        "message": "ok",
                        "datawallet": {
                            "holdingslist": holdings,
                            "next": next_page
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
                        print("Gagal setelah 10 percobaan karena status 403")
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