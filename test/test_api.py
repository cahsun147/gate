# api/test_api.py
# Versi 10: Diperbarui untuk menangani rute async secara modern.

import sys
import os
import asyncio
from flask import Flask, request, jsonify, Response

# Menambahkan path agar bisa mengimpor dari subdirektori v1
# Pastikan struktur folder Anda adalah /api/v1/dex/dex.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mengimpor handler dari file dex.py yang telah kita perbarui
from test.dex import handler as dex_handler
# Impor handler lainnya (tetap sama)
from api.v1.tokens.holder import handler as holder_handler
from api.v1.tokens.traders import handler as traders_handler
from api.v1.wallet.holdings import handler as holdings_handler
from api.v1.wallet.flow import handler as flow_handler
from api.v1.wallet.activity import handler as activity_handler
from api.v1.wallet.statistics import handler as statistics_handler
from api.v1.tokens.trends import handler as trends_handler

app = Flask(__name__)

# Mock request class untuk menjaga kompatibilitas dengan handler
class MockRequest:
    def __init__(self, args):
        self.args = args

@app.route("/api", methods=["GET"])
def hello_root():
    return "<p>Hello from /api/index.py!</p>"

# PEMBARUAN: Rute ini sekarang menggunakan `async def` untuk penanganan yang lebih bersih.
# Tidak perlu lagi mengelola event loop secara manual.
@app.route("/api/dex", methods=["GET"])
async def proxy_dex():
    try:
        req = MockRequest(request.args)
        # Panggil handler async secara langsung dengan 'await'
        result, status = await dex_handler(req)
        return Response(result, status=status, mimetype='application/json')
    except Exception as e:
        print(f"Error in /api/dex: {e}")
        return jsonify({"error": str(e)}), 500

# --- Rute-rute lainnya tetap tidak berubah ---
# (Kode di bawah ini sama seperti file asli Anda)

@app.route("/api/v1/tokens/holder/<network>/<contract_address>", methods=["GET"])
def proxy_holder(network, contract_address):
    try:
        limit = request.args.get('limit', '100')
        orderby = request.args.get('orderby', 'amount_percentage')
        direction = request.args.get('direction', 'desc')
        tag = request.args.get('tag', '')
        result, status = holder_handler(network, contract_address, limit, orderby, direction, tag)
        return Response(result, status=status, mimetype='application/json')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/tokens/traders/<network>/<contract_address>", methods=["GET"])
def proxy_traders(network, contract_address):
    try:
        limit = request.args.get('limit', '100')
        orderby = request.args.get('orderby', 'buy_volume_cur')
        direction = request.args.get('direction', 'desc')
        tag = request.args.get('tag', '')
        result, status = traders_handler(network, contract_address, limit, orderby, direction, tag)
        return Response(result, status=status, mimetype='application/json')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/wallet/holdings/<network>/<wallet_address>", methods=["GET"])
def proxy_holdings(network, wallet_address):
    try:
        limit = request.args.get('limit', '50')
        orderby = request.args.get('orderby', 'last_active_timestamp')
        direction = request.args.get('direction', 'desc')
        showsmall = request.args.get('showsmall', 'false')
        sellout = request.args.get('sellout', 'false')
        hide_abnormal = request.args.get('hide_abnormal', 'false')
        result, status = holdings_handler(network, wallet_address, limit, orderby, direction, showsmall, sellout, hide_abnormal)
        return Response(result, status=status, mimetype='application/json')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/wallet/flow/<network>/<wallet_address>", methods=["GET"])
def proxy_flow(network, wallet_address):
    try:
        limit = request.args.get('limit', '50')
        orderby = request.args.get('orderby', 'last_active_timestamp')
        direction = request.args.get('direction', 'desc')
        result, status = flow_handler(network, wallet_address, limit, orderby, direction)
        return Response(result, status=status, mimetype='application/json')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/wallet/activity/<network>/<wallet_address>", methods=["GET"])
def proxy_activity(network, wallet_address):
    try:
        limit = request.args.get('limit', '50')
        result, status = activity_handler(network, wallet_address, limit)
        return Response(result, status=status, mimetype='application/json')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/wallet/statistics/<network>/<wallet_address>", methods=["GET"])
def proxy_statistics(network, wallet_address):
    try:
        period = request.args.get('period', '1d')
        result, status = statistics_handler(network, wallet_address, period)
        return Response(result, status=status, mimetype='application/json')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/tokens/trends/<network>/<contract_address>", methods=["GET"])
def proxy_trends(network, contract_address):
    try:
        result, status = trends_handler(network, contract_address)
        return Response(result, status=status, mimetype='application/json')
    except Exception as e:
        return jsonify({"error": str(e)}), 500
