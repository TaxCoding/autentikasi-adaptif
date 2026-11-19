/**
 * ============================================================
 * LOGIKA EVALUASI PROPOSISI AUTENTIKASI
 * Porting 1-ke-1 dari kode C++ Sistem Rekomendasi Autentikasi
 * ============================================================
 */

const NAMA_PERANGKAT = {
  1: "Smartphone",
  2: "Laptop / Komputer",
  3: "Tablet",
  4: "Perangkat lainnya",
};

/**
 * Membuat state awal DataAutentikasi
 * @returns {{
 *   jenisPerangkat: number|null,
 *   risikoTinggi: boolean|null,
 *   perangkatTidakDikenal: boolean|null,
 *   aksesSensitif: boolean|null,
 *   mendukungPasskey: boolean|null
 * }}
 */
function buatDataAwal() {
  return {
    jenisPerangkat: null,
    risikoTinggi: null,
    perangkatTidakDikenal: null,
    aksesSensitif: null,
    mendukungPasskey: null,
  };
}

/**
 * Mengevaluasi proposisi input (H, U, S, K) dan output (M, B, P)
 * sesuai fungsi evaluasiLogika(DataAutentikasi data) pada C++.
 *
 * Catatan nilai:
 * - true  -> 'B' (Benar)
 * - false -> 'T' (Tidak)
 * - null  -> Belum dievaluasi
 */
function evaluasiLogika(data) {
  const H = data.risikoTinggi;
  const U = data.perangkatTidakDikenal;
  const S = data.aksesSensitif;

  // K = (data.jenisPerangkat != 4) && data.mendukungPasskey
  let K = null;
  if (data.jenisPerangkat !== null && data.mendukungPasskey !== null) {
    K = data.jenisPerangkat !== 4 && Boolean(data.mendukungPasskey);
  }

  // Evaluasi parsial / penuh untuk M = H || U || S
  let M = null;
  if (H === true || U === true || S === true) {
    M = true;
  } else if (H === false && U === false && S === false) {
    M = false;
  }

  // Aturan 2: Passkey -> B = !M && K
  let B = null;
  if (M === true) {
    B = false;
  } else if (M === false && K !== null) {
    B = !M && K;
  }

  // Aturan 3: Password -> P = !M && !K
  let P = null;
  if (M === true) {
    P = false;
  } else if (M === false && K !== null) {
    P = !M && !K;
  }

  return {
    H,
    U,
    S,
    K,
    M,
    B,
    P,
  };
}

/**
 * Menghasilkan detail rekomendasi akhir (setara tampilkanHasil pada C++)
 */
function buatDetailRekomendasi(data, hasil) {
  const perangkat = NAMA_PERANGKAT[data.jenisPerangkat] || "Tidak diketahui";

  if (hasil.M) {
    const alasan = ["Terdapat minimal satu indikator risiko."];
    if (data.risikoTinggi) alasan.push("Risiko akses teridentifikasi tinggi (H = B).");
    if (data.perangkatTidakDikenal) alasan.push("Perangkat belum dikenal sistem (U = B).");
    if (data.aksesSensitif) alasan.push("Akses menuju data sensitif (S = B).");

    return {
      kode: "mfa",
      judul: "MULTI-FACTOR AUTHENTICATION (MFA)",
      alasan,
      contohMetode: "Password + aplikasi autentikator (TOTP) / verifikasi berlapis.",
    };
  }

  if (hasil.B) {
    return {
      kode: "passkey",
      judul: "PASSKEY",
      alasan: [
        "Tidak terdapat indikator risiko tinggi (M = T).",
        "Perangkat termasuk kategori didukung dan mendukung passkey (K = B).",
      ],
      contohMetode: "Biometrik perangkat (sidik jari / Face ID) atau PIN keamanan lokal.",
    };
  }

  const alasanPassword = ["Tidak terdapat indikator risiko tinggi (M = T)."];
  if (data.jenisPerangkat === 4 && data.mendukungPasskey) {
    alasanPassword.push(
      "Kategori 'Perangkat lainnya' tidak didukung model untuk passkey sehingga K bernilai T."
    );
  } else {
    alasanPassword.push("Passkey tidak tersedia atau tidak didukung perangkat (K = T).");
  }

  return {
    kode: "password",
    judul: "PASSWORD",
    alasan: alasanPassword,
    contohMetode: "Kata sandi kuat unik (minimal 12 karakter) dengan pengelola sandi.",
  };
}
