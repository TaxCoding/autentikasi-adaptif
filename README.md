# Autentikasi Adaptif (Logika Matematika)

Situs statis: HTML + CSS + JavaScript biasa. Tidak perlu build, tidak perlu npm.

## Struktur
- `interaksi.js`  : SEMUA teks dialog (ubah di sini)
- `logika.js`     : logika proposisi p, q, r, s dan tabel kebenaran
- `app.js`        : mesin dialog (biasanya tidak perlu diubah)
- `index.html`, `style.css`
- `assets/latar.jpg` : foto latar. Ganti file ini untuk ganti foto (rasio 3:4 paling pas)

## Jalankan lokal
Buka `index.html` di browser.

## Deploy ke Vercel
1. Upload folder ini ke GitHub, lalu di vercel.com pilih Add New > Project > import repo.
   Framework Preset: Other. Build Command dan Output Directory dikosongkan.
2. Atau dengan CLI: `npm i -g vercel`, lalu jalankan `vercel` di dalam folder ini.
