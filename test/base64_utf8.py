import base64

# Nama file input yang berisi string Base64
nama_file_input = 'base64.txt'
# Nama file output untuk menyimpan hasil UTF-8
nama_file_output = 'data.txt'

try:
    # 1. Membaca string Base64 dari file
    with open(nama_file_input, 'r') as file:
        base64_string = file.read().strip()

    # 2. Mendekode string Base64 ke dalam bentuk bytes (data biner)
    decoded_bytes = base64.b64decode(base64_string)

    # 3. MEMAKSA konversi data biner ke string UTF-8.
    #    'errors="replace"' akan mengganti byte yang tidak valid dengan simbol '�'.
    hasil_utf8 = decoded_bytes.decode('utf-8', errors='replace')

    # 4. Menyimpan hasil ke file baru
    with open(nama_file_output, 'w', encoding='utf-8') as file:
        file.write(hasil_utf8)

    # --- CUSTOM OUTPUT ---
    print("===============================================")
    print("✅ PROSES KONVERSI PAKSA KE UTF-8 BERHASIL ✅")
    print("-----------------------------------------------")
    print(f"File input : {nama_file_input}")
    print(f"File output: {nama_file_output}")
    print("\nPotongan Hasil (500 karakter pertama):")
    print("-----------------------------------------------")
    print(hasil_utf8[:500])
    print("...")
    print("\nCATATAN: Simbol '�' menunjukkan data biner yang tidak bisa diubah menjadi teks.")
    print("===============================================")


except FileNotFoundError:
    print(f"❌ ERROR: File '{nama_file_input}' tidak ditemukan.")
except Exception as e:
    print(f"❌ Terjadi kesalahan: {e}")
