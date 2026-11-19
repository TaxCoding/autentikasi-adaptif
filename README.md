# Sistem Rekomendasi Autentikasi — Web Dialog Game (JavaScript)

Aplikasi web interaktif bergaya **Visual Novel / Dialog Game** yang mengimplementasikan logika proposisi dari program C++ **Sistem Rekomendasi Autentikasi**.

## Struktur Folder
```text
sistem-autentikasi-dialog-js/
├── index.html          # Struktur antarmuka web (HUD atas & kotak dialog King)
├── css/
│   └── style.css       # Styling visual novel, progress bar, dan indikator B / T
├── js/
│   ├── logic.js        # Porting logika proposisi C++ (H, U, S, K -> M, B, P)
│   └── dialog.js       # State machine dialog, efek ketik, dan pembaruan HUD
├── assets/
│   └── bg-king.jpg     # Gambar latar belakang karakter King
└── README.md           # Dokumentasi singkat proyek
```

## Cara Menjalankan
1. Ekstrak file `.zip` ini ke folder mana saja.
2. Buka file **`index.html`** langsung menggunakan browser (Chrome, Edge, Firefox, atau Safari). Tidak memerlukan server tambahan atau instalasi dependensi.

## Pemetaan Logika Proposisi
- **Proposisi Input** (ditampilkan di bagian atas beserta status **`B`** = Benar atau **`T`** = Tidak di bawah simbolnya):
  - **`H`**: Risiko akses tinggi (`risikoTinggi`)
  - **`U`**: Perangkat tidak dikenal (`perangkatTidakDikenal`)
  - **`S`**: Mengakses data sensitif (`aksesSensitif`)
  - **`K`**: `(jenisPerangkat != 4) && mendukungPasskey`
- **Proposisi Output**:
  - **`M = H ∨ U ∨ S`** → Rekomendasi **Multi-Factor Authentication (MFA)**
  - **`B = ¬M ∧ K`** → Rekomendasi **Passkey**
  - **`P = ¬M ∧ ¬K`** → Rekomendasi **Password**
