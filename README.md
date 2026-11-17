# SawitScale Pro — Aplikasi Timbangan TBS Mobile (Android)

Aplikasi pencatatan operasional **RAM / Peron Timbangan TBS Kelapa Sawit** berbasis Mobile-First PWA yang dirancang untuk dijalankan di HP/Tablet **Android** secara **100% Offline**, dilengkapi perhitungan otomatis, manajemen kasbon petani, cetak struk thermal Bluetooth (58mm/80mm), dan laporan pembelian, penjualan PKS, susut tonase, serta laba/rugi.

## Fitur Utama

1. **Timbang Masuk — Pembelian TBS dari Petani / Pemasok**
   - Mode **Timbang Langsung (1-Tahap)** maupun **Antrean Truk di Dalam RAM (Timbang 1 / Bruto Gantung -> Timbang 2 / Tara)**.
   - Perhitungan otomatis: `Bruto - Tara = Netto 1`, `Potongan Sortasi Wajib (%) + Potongan Tambahan (kg) = Total Potongan`, dan **Netto Bersih (kg)**.
   - Otomatis memuat **Harga Khusus Petani** (atau Harga Harian RAM), menghitung **Biaya Bongkar / SPSI**, dan **Potong Kasbon Petani** langsung dari nota timbangan.
2. **Timbang Keluar — Penjualan / Pengiriman DO ke Pabrik (PKS)**
   - Pencatatan pengiriman TBS ke Pabrik Kelapa Sawit (PKS) beserta Nomor DO/SPB, Plat Truk, Sopir, Bruto, Tara, Refraksi/Sortasi Pabrik (%), Harga DO, Ongkos Angkut Ekspedisi, dan Upah Muat.
3. **Laporan Pembelian, Penjualan, Susut RAM & Laba Rugi**
   - Filter periode tanggal (Hari Ini, 7 Hari, Bulan Ini, Semua, atau Rentang Tanggal Kustom), filter Petani/PKS, dan pencarian cepat.
   - **4 Kartu KPI Eksekutif**: Total Pembelian TBS, Total Penjualan PKS, Analisis Stok Lantai RAM / Susut Tonase, dan Estimasi Laba/Rugi Operasional (beserta Margin Spread Rp/kg).
   - **Tabel Responsif**: Rincian Pembelian, Rincian Penjualan PKS, serta Rekapitulasi Per Petani dan Per Pabrik.
   - **Export Excel/CSV (`.csv`)** dan **Cetak / Simpan PDF Laporan**.
4. **Cetak Struk Thermal (58mm / 80mm) & Share WhatsApp**
   - Pratinjau struk kasir format kertas thermal 58mm atau 80mm siap cetak ke printer thermal Bluetooth Android, kirim rincian nota langsung ke WhatsApp petani, atau salin teks nota.
5. **Master Data Mitra, Kasbon & Backup Offline**
   - Kelola daftar petani, pabrik PKS, pencatatan pinjaman/bayar kasbon manual, serta Backup & Restore database lokal (`.json`).

---

## Cara Menjalankan di Komputer & HP Android

### 1. Jalankan Server Lokal
```bash
npm start
```
Server akan berjalan di `http://localhost:3000` dan menampilkan alamat IP WiFi lokal (misal `http://192.168.1.x:3000`).

### 2. Buka & Install di HP Android (Tanpa Build APK)
1. Hubungkan HP Android ke jaringan WiFi/Hotspot yang sama (atau deploy folder ini ke hosting statis seperti Netlify/Vercel/GitHub Pages).
2. Buka alamat URL di **Google Chrome Android**.
3. Klik tombol **"Install Android"** di pojok kanan atas aplikasi (atau menu Chrome **Tambahkan ke Layar Utama / Install Aplikasi**).
4. Aplikasi akan ter-install di layar utama Android dan dapat dijalankan **100% Offline** tanpa kuota internet.

### 3. (Opsional) Bungkus Menjadi File `.APK` Android dengan Capacitor
File `capacitor.config.json` sudah disiapkan. Jika ingin membuat file `.apk` native melalui Android Studio:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync
npx cap open android
```
