/* ==========================================================================
   logika.js — inti Logika Matematika (port dari prototipe Python)
   p : Sensitivitas akses   (1 = data sensitif,            0 = data umum)
   q : Status perangkat     (1 = publik / tidak dikenal,   0 = pribadi / terdaftar)
   r : Keamanan jaringan    (1 = IP asing / VPN / curiga,  0 = jaringan terpercaya)
   s : Anomali waktu        (1 = jam tidak wajar 01.00-05.00, 0 = jam wajar)
   ========================================================================== */

const KEPUTUSAN = {
  A1: { kode: "A1", output: "LOW SECURITY: Cukup Password Utama",                       rumus: "R1: (¬p ∧ ¬q ∧ ¬r ∧ ¬s) ∨ (p ∧ ¬q ∧ ¬r ∧ ¬s) ⇒ A1" },
  A2: { kode: "A2", output: "MEDIUM SECURITY: Wajib Password + OTP (2FA)",              rumus: "R2: (¬p ∧ (q ∨ r ∨ s)) ∨ (p ∧ RisikoTunggal) ⇒ A2" },
  A3: { kode: "A3", output: "HIGH SECURITY: Wajib Biometrik / Passkey / Hardware Key",  rumus: "R3: p ∧ ((q∧r) ∨ (q∧s) ∨ (r∧s)) ∧ ¬(q∧r∧s) ⇒ A3" },
  A4: { kode: "A4", output: "CRITICAL RISK: Akses Diblokir Sepenuhnya",                 rumus: "R4: p ∧ (q ∧ r ∧ s) ⇒ A4" }
};

function evaluasiAutentikasi(p, q, r, s) {
  const jumlahRisiko = [q, r, s].filter(Boolean).length;

  // Sub-ekspresi logika formal
  const tanpaRisiko  = !q && !r && !s;
  const risikoTunggal = (q && !r && !s) || (!q && r && !s) || (!q && !r && s);
  const risikoGanda   = ((q && r) || (q && s) || (r && s)) && !(q && r && s);
  const risikoTotal   = q && r && s;

  // Aturan evaluasi
  const rule1 = (!p && tanpaRisiko) || (p && tanpaRisiko);
  const rule2 = (!p && (q || r || s)) || (p && risikoTunggal);
  const rule3 = p && risikoGanda;
  const rule4 = p && risikoTotal;

  // Inferensi keputusan (modus ponens), dicek dari risiko tertinggi
  let kode;
  if (rule4) kode = "A4";
  else if (rule3) kode = "A3";
  else if (rule2) kode = "A2";
  else kode = "A1";

  return { ...KEPUTUSAN[kode], p, q, r, s, jumlahRisiko };
}

// 16 kombinasi (2^4) untuk tabel kebenaran, urutan sama dengan itertools.product Python
function semuaKombinasi() {
  const hasil = [];
  for (let n = 0; n < 16; n++) {
    const p = !!(n & 8), q = !!(n & 4), r = !!(n & 2), s = !!(n & 1);
    hasil.push(evaluasiAutentikasi(p, q, r, s));
  }
  return hasil;
}
