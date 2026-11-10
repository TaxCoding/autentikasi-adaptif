/* ==========================================================================
   interaksi.js — SEMUA TEKS DIALOG ADA DI SINI. Ubah sesuka hati.

   Cara pakai:
   - Setiap "teks" adalah daftar kalimat. Satu kalimat = satu kali tap/klik.
   - Kalimat terakhir pada satu langkah akan memunculkan tombol pilihan.
   - Tulis {jam} untuk menampilkan jam perangkat saat ini (contoh: 22.42).
   - Jangan ubah nama kunci di sebelah kiri (variabel, ya, tidak, dst.),
     cukup ubah teks di sebelah kanannya.
   ========================================================================== */

const INTERAKSI = {

  /* ---------- Pengaturan umum ---------- */
  pengaturan: {
    namaPembicara: "King",     // nama di label kecil di atas kotak dialog
    kecepatanKetik: 26           // milidetik per huruf (makin kecil makin cepat)
  },

  /* ---------- Pembuka ---------- */
  pembuka: {
    teks: [
      "Hahaha, apa kau ingin tau autentikasi sesuai keadaanmu?"
    ],
    mau: "Iya, mau",
    tidak: "Engga deh"
  },

  /* ---------- Kalau pengguna memilih "Engga deh" ---------- */
  menolak: {
    teks: [
      "Baiklah anak muda",
      "Aku tetap disini jika engkau berubah pikiran"
    ],
    tombol: "Aku berubah pikiran"
  },

  /* ---------- Kalau pengguna memilih "Iya, mau" ---------- */
  setuju: [
    "Wahaha, kalau gitu jawab pertanyaanku."
  ],

  /* ---------- Empat pertanyaan (urutan p, q, r, s) ----------
     variabel       : jangan diubah
     teks           : kalimat yang diucapkan sebelum pilihan muncul
     ya / tidak     : tulisan pada dua tombol (ya = nilai 1, tidak = nilai 0)
     tanggapanYa    : (opsional) kalimat tambahan setelah menjawab "ya"
     tanggapanTidak : (opsional) kalimat tambahan setelah menjawab "tidak"
     nama, nilaiYa, nilaiTidak : dipakai di ringkasan jawaban pada kartu hasil */
  pertanyaan: [
    {
      variabel: "p",
      teks: [
        "Yang saudara lakukan hal sensitif?",
        "Contohnya: ubah nilai, transaksi, atau akses admin."
      ],
      ya: "Iya, sensitif bang",
      tidak: "Engga bang",
      tanggapanYa: [],
      tanggapanTidak: [],
      nama: "Kebutuhan akses",
      nilaiYa: "Data sensitif",
      nilaiTidak: "Data umum"
    },
    {
      variabel: "q",
      teks: [
        "Naruhodo, lantas apakah kau memakai perangkat publik atau perangkat yang tidak dikenal?"
      ],
      ya: "Iya deh keknya",
      tidak: "Bukan bang king",
      tanggapanYa: [],
      tanggapanTidak: [],
      nama: "Jenis perangkat",
      nilaiYa: "Publik / tidak dikenal",
      nilaiTidak: "Pribadi / terdaftar"
    },
    {
      variabel: "r",
      teks: [
        "Oke, selanjutnya gimana sama jaringanmu?",
        "Apakah terdeteksi IP asing, VPN, atau lokasi yang mencurigakan?"
      ],
      ya: "agak Sus gitu",
      tidak: "Terpercaya mah bang",
      tanggapanYa: [],
      tanggapanTidak: [],
      nama: "Keamanan jaringan",
      nilaiYa: "IP asing / VPN / curiga",
      nilaiTidak: "Jaringan terpercaya"
    },
    {
      variabel: "s",
      teks: [
        "Naruhodo, pertanyaan terakhir!",
        "Sekarang jam {jam} di perangkatmu. Apakah kau sedang login di jam yang tidak wajar (01.00 sampai 05.00)?"
      ],
      ya: "Iya ga wajar sih",
      tidak: "normal inimah",
      tanggapanYa: [],
      tanggapanTidak: [],
      nama: "Anomali waktu",
      nilaiYa: "Jam tidak wajar",
      nilaiTidak: "Jam kerja / kuliah wajar"
    }
  ],

  /* ---------- Kalimat sebelum hasil keluar ---------- */
  sebelumHasil: [
    "Hmm... Hmm... AHAHAHA naruhodo, bang king udah menimbang jawabanmu..."
  ],

  /* ---------- Hasil untuk tiap kode keputusan ---------- */
  hasil: {
    A1: {
      teks: [
        "Selow aman ni keknya",
        "Password aja cukup lah ya"
      ],
      tingkat: "Keamanan rendah",
      rekomendasi: "Cukup password utama"
    },
    A2: {
      teks: [
        "Wahh ada something ini, mending langkah pencegahan",
        "Password saja tidak cukup. Tambahkan kode OTP."
      ],
      tingkat: "Keamanan menengah",
      rekomendasi: "Wajib password + OTP (2FA)"
    },
    A3: {
      teks: [
        "Waduh ini udah tanda ini dek, jadi udah agak bahaya ini...",
        "Kau harus pakai biometrik, passkey, atau hardware key."
      ],
      tingkat: "Keamanan tinggi",
      rekomendasi: "Wajib biometrik / passkey / hardware key"
    },
    A4: {
      teks: [
        "PRITT PRITTT, wait ini mah fatal ini woi!!",
        "Aku tidak bisa membiarkanmu masuk. Akses diblokir sepenuhnya."
      ],
      tingkat: "Risiko kritis",
      rekomendasi: "Akses diblokir sepenuhnya"
    }
  },

  /* ---------- Tulisan pada kartu hasil dan tabel ---------- */
  antarmuka: {
    judulKartu: "Rekomendasi autentikasi",
    labelRingkasan: "Jawabanmu",
    labelRumus: "Aturan yang terpicu",
    tombolTabel: "Lihat tabel kebenaran",
    tombolUlang: "Ulangi dari awal",
    judulTabel: "Tabel kebenaran (2⁴ = 16 kombinasi)",
    tombolTutup: "Tutup",
    petunjukLanjut: "Ketuk untuk lanjut",
    nilaiYa: "1",
    nilaiTidak: "0"
  }
};
