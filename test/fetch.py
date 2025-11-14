import re
import string
from typing import List

def clean_binary_data(data: bytes) -> bytes:
    """
    Membersihkan data biner dengan menghapus byte nol dan karakter yang tidak diinginkan.
    """
    cleaned_data = bytearray()
    for byte in data:
        if byte != 0 and byte not in (0xFF, 0xFE, 0xC2, 0xA0):
            cleaned_data.append(byte)
    return bytes(cleaned_data)

def remove_non_printable(s: str) -> str:
    allowed = set(string.ascii_letters + string.digits + " \n")
    return ''.join(filter(lambda x: x in allowed, s))

def extract_contract_addresses(data: bytes) -> List[str]:
    """
    Extracts contract addresses from binary data with Hyperliquid-specific formatting.
    Handles both pair addresses and token contract addresses separated by 'D'.
    """
    try:
        decoded_data = data.decode('utf-8', errors='ignore')
        #print("Decoded data:", remove_non_printable(decoded_data))
        pattern = r'D(0x[a-fA-F0-9]{32,40})D(0x[a-fA-F0-9]{32,40})'
        pairs = re.findall(pattern, decoded_data)
        print(f"Pairs found: {len(pairs)}")
        print("Pairs detail:", pairs)
        contract_addresses = [contract for pair, contract in pairs]
        print(f"Contract addresses found: {len(contract_addresses)}")
        print("Contract addresses detail:", contract_addresses)
        return contract_addresses
    except Exception as e:
        print(f"Error processing data: {str(e)}")
        return []

def extract_pair_and_contract_addresses(data_str: str):
    """
    Mengekstrak pair address dan contract address untuk EVM, Solana, TON, Tron, dan Hyperliquid.
    Hasil berupa dict: {chain: [(pair_addr, contract_addr), ...]}
    """
    result = {}

    # EVM: T(pair_addr)T(contract_addr)
    evm = re.findall(r'T(0x[0-9a-fA-F]{40})T(0x[0-9a-fA-F]{40})', data_str)
    result['evm'] = evm

    # Solana: X(pair_addr)X(contract_addr)
    solana = re.findall(r'X([1-9A-HJ-NP-Za-km-z]{43,44})X([1-9A-HJ-NP-Za-km-z]{43,44})', data_str)
    result['solana'] = solana

    # TON: `(pair_addr)`(contract_addr)
    ton = re.findall(r'`(EQ[A-Za-z0-9_-]{46})`(EQ[A-Za-z0-9_-]{46})', data_str)
    result['ton'] = ton

    # Tron: D(pair_addr)D(contract_addr)
    tron = re.findall(r'D(T[A-Za-z0-9]{33})D(T[A-Za-z0-9]{33})', data_str)
    result['tron'] = tron

    # Hyperliquid/Sui: D(pair_addr)D(contract_addr)
    hyperliquid = re.findall(r'D(0x[a-fA-F0-9]{32,40})D(0x[a-fA-F0-9]{32,40})', data_str)
    result['hyperliquid'] = hyperliquid

    # Sui (jika format berbeda, contoh: \x01... )
    sui = re.findall(r'\x01(0x[a-fA-F0-9]{64})\x01(0x[a-fA-F0-9]{64}::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+)', data_str)
    result['sui'] = sui

    # Log hasil
    for chain, pairs in result.items():
        print(f"{chain.upper()} - Pair/Contract found: {len(pairs)}")
        for pair_addr, contract_addr in pairs:
            print(f"  Pair: {pair_addr} | Contract: {contract_addr}")

    return result

# Membaca data dari file data.txt
with open('data.txt', 'rb') as file:
    data = file.read()

# Membersihkan data biner sebelum ekstraksi
cleaned_data = clean_binary_data(data)

# Mengambil alamat kontrak dari data yang telah dibersihkan
addresses = extract_contract_addresses(cleaned_data)
print("Contract addresses found:", addresses)

with open('data.txt', 'r', encoding='utf-8', errors='ignore') as f:
    data_str = f.read()

extract_pair_and_contract_addresses(data_str)