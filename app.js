/* ==========================================================================
   app.js — mesin dialog. Teks ada di interaksi.js, logika ada di logika.js.
   Biasanya file ini tidak perlu diubah.
   ========================================================================== */
(function () {
  "use strict";

  const I = INTERAKSI;
  const $ = (id) => document.getElementById(id);

  const kotak = $("kotak"), teksEl = $("teks"), namaEl = $("nama"), pilihanEl = $("pilihan");
  const lanjutEl = $("lanjut"), liveEl = $("live"), pipsEl = $("pips");
  const hasilEl = $("hasil"), tabelPanel = $("tabel-panel");
  const btnTabel = $("btn-tabel"), btnUlang = $("btn-ulang"), btnTutup = $("btn-tutup");

  const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let mode = "idle";      // idle | mengetik | menunggu | memilih
  let skipKetik = null;   // fungsi untuk melewati animasi ketik
  let majuLanjut = null;  // fungsi untuk lanjut ke kalimat berikutnya
  let jawaban = {};

  /* ---------- Util ---------- */
  function isiTemplat(teks) {
    const jam = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
    return teks.replace(/\{jam\}/g, jam);
  }

  function ketik(teks) {
    return new Promise((selesai) => {
      liveEl.textContent = teks;
      const kecepatan = I.pengaturan.kecepatanKetik;
      if (kurangiGerak || !kecepatan || kecepatan <= 0) {
        teksEl.textContent = teks;
        return selesai();
      }
      const huruf = Array.from(teks);
      let i = 0;
      teksEl.textContent = "";
      mode = "mengetik";
      const timer = setInterval(() => {
        i++;
        teksEl.textContent = huruf.slice(0, i).join("");
        if (i >= huruf.length) {
          clearInterval(timer);
          mode = "idle"; skipKetik = null;
          selesai();
        }
      }, kecepatan);
      skipKetik = () => {
        clearInterval(timer);
        teksEl.textContent = teks;
        mode = "idle"; skipKetik = null;
        selesai();
      };
    });
  }

  function tungguLanjut() {
    return new Promise((selesai) => {
      mode = "menunggu";
      lanjutEl.hidden = false;
      majuLanjut = () => {
        lanjutEl.hidden = true;
        mode = "idle"; majuLanjut = null;
        selesai();
      };
    });
  }

  function tampilPilihan(daftar) {
    return new Promise((selesai) => {
      mode = "memilih";
      pilihanEl.textContent = "";
      daftar.forEach((label, idx) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.addEventListener("click", () => {
          pilihanEl.textContent = "";
          mode = "idle";
          selesai(idx);
        });
        pilihanEl.appendChild(b);
      });
      pilihanEl.firstElementChild.focus({ preventScroll: true });
    });
  }

  // Ucapkan beberapa kalimat. Kalau ada pilihan, kembalikan indeks pilihan.
  async function bicara(kalimat, pilihan) {
    const daftar = kalimat.map(isiTemplat);
    for (let i = 0; i < daftar.length; i++) {
      const terakhir = i === daftar.length - 1;
      await ketik(daftar[i]);
      if (!(terakhir && pilihan && pilihan.length)) await tungguLanjut();
    }
    if (pilihan && pilihan.length) return tampilPilihan(pilihan);
  }

  function tekanKotak() {
    if (mode === "mengetik" && skipKetik) skipKetik();
    else if (mode === "menunggu" && majuLanjut) majuLanjut();
  }

  /* ---------- Penanda kemajuan ---------- */
  function buatPips() {
    pipsEl.textContent = "";
    I.pertanyaan.forEach((q) => {
      const li = document.createElement("li");
      li.className = "pip";
      li.dataset.v = q.variabel;
      li.innerHTML = '<span class="huruf"></span><span class="bit"></span>';
      li.querySelector(".huruf").textContent = q.variabel;
      pipsEl.appendChild(li);
    });
  }

  function aturPips(aktif) {
    [...pipsEl.children].forEach((li, idx) => {
      const v = li.dataset.v;
      const sudah = v in jawaban;
      li.classList.toggle("selesai", sudah);
      li.classList.toggle("aktif", !sudah && idx === aktif);
      li.querySelector(".bit").textContent = sudah ? (jawaban[v] ? I.antarmuka.nilaiYa : I.antarmuka.nilaiTidak) : "";
    });
  }

  /* ---------- Kartu hasil ---------- */
  function tampilHasil(h) {
    const teksHasil = I.hasil[h.kode];
    hasilEl.dataset.kode = h.kode;
    $("hasil-kode").textContent = h.kode;
    $("hasil-tingkat").textContent = teksHasil.tingkat;
    $("hasil-judul").textContent = teksHasil.rekomendasi;
    $("hasil-label-ringkasan").textContent = I.antarmuka.labelRingkasan;
    $("hasil-label-rumus").textContent = I.antarmuka.labelRumus;
    $("hasil-rumus").textContent = h.rumus;
    btnTabel.textContent = I.antarmuka.tombolTabel;
    btnUlang.textContent = I.antarmuka.tombolUlang;

    const ul = $("ringkasan");
    ul.textContent = "";
    I.pertanyaan.forEach((q) => {
      const nilai = jawaban[q.variabel];
      const li = document.createElement("li");
      li.innerHTML = '<span class="var"></span><span><span class="judul"></span><br><span class="nilai"></span></span><span class="bit"></span>';
      li.querySelector(".var").textContent = q.variabel;
      li.querySelector(".judul").textContent = q.nama;
      li.querySelector(".nilai").textContent = nilai ? q.nilaiYa : q.nilaiTidak;
      li.querySelector(".bit").textContent = nilai ? I.antarmuka.nilaiYa : I.antarmuka.nilaiTidak;
      ul.appendChild(li);
    });

    kotak.hidden = true;
    hasilEl.hidden = false;
    hasilEl.scrollTop = 0;
    btnUlang.focus({ preventScroll: true });
  }

  /* ---------- Tabel kebenaran ---------- */
  const WARNA = { A1: "var(--tingkat-A1)", A2: "var(--tingkat-A2)", A3: "var(--tingkat-A3)", A4: "var(--tingkat-A4)" };

  function isiTabel(sekarang) {
    $("tabel-judul").textContent = I.antarmuka.judulTabel;
    btnTutup.textContent = I.antarmuka.tombolTutup;
    const tbody = document.querySelector("#tabel tbody");
    tbody.textContent = "";
    semuaKombinasi().forEach((k, idx) => {
      const tr = document.createElement("tr");
      if (sekarang && k.p === sekarang.p && k.q === sekarang.q && k.r === sekarang.r && k.s === sekarang.s) {
        tr.className = "sekarang";
        tr.setAttribute("aria-current", "true");
      }
      const bit = (b) => (b ? "1" : "0");
      const sel = [idx + 1, bit(k.p), bit(k.q), bit(k.r), bit(k.s), k.jumlahRisiko];
      sel.forEach((v) => {
        const td = document.createElement("td");
        td.textContent = v;
        if (v === "0") td.className = "nol";
        tr.appendChild(td);
      });
      const tdKode = document.createElement("td");
      tdKode.className = "kodesel";
      const span = document.createElement("span");
      span.textContent = k.kode;
      span.style.background = WARNA[k.kode];
      tdKode.appendChild(span);
      tr.appendChild(tdKode);
      tbody.appendChild(tr);
    });
  }

  let hasilSekarang = null;

  function bukaTabel() {
    isiTabel(hasilSekarang);
    tabelPanel.hidden = false;
    btnTutup.focus({ preventScroll: true });
    const baris = tabelPanel.querySelector("tr.sekarang");
    if (baris) baris.scrollIntoView({ block: "center" });
  }
  function tutupTabel() {
    tabelPanel.hidden = true;
    btnTabel.focus({ preventScroll: true });
  }

  btnTabel.addEventListener("click", bukaTabel);
  btnTutup.addEventListener("click", tutupTabel);

  /* ---------- Input ---------- */
  kotak.addEventListener("click", tekanKotak);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !tabelPanel.hidden) { tutupTabel(); return; }
    if (e.key !== "Enter" && e.key !== " ") return;
    if (!tabelPanel.hidden || !hasilEl.hidden) return;
    if (e.target && e.target.tagName === "BUTTON") return;
    e.preventDefault();
    tekanKotak();
  });

  /* ---------- Alur utama ---------- */
  async function jalan() {
    namaEl.textContent = I.pengaturan.namaPembicara;
    lanjutEl.setAttribute("title", I.antarmuka.petunjukLanjut);
    buatPips();

    while (true) {
      jawaban = {};
      hasilSekarang = null;
      hasilEl.hidden = true;
      tabelPanel.hidden = true;
      kotak.hidden = false;
      teksEl.textContent = "";
      aturPips(-1);

      // 1. Pembuka
      const pilihanAwal = await bicara(I.pembuka.teks, [I.pembuka.mau, I.pembuka.tidak]);
      if (pilihanAwal === 1) {
        await bicara(I.menolak.teks, [I.menolak.tombol]);
        continue;
      }

      // 2. Setuju, lalu empat pertanyaan
      await bicara(I.setuju);
      for (let i = 0; i < I.pertanyaan.length; i++) {
        const q = I.pertanyaan[i];
        aturPips(i);
        const pilih = await bicara(q.teks, [q.ya, q.tidak]);
        const ya = pilih === 0;
        jawaban[q.variabel] = ya;
        aturPips(i + 1);
        const tanggapan = ya ? q.tanggapanYa : q.tanggapanTidak;
        if (tanggapan && tanggapan.length) await bicara(tanggapan);
      }

      // 3. Hitung dan tampilkan hasil
      await bicara(I.sebelumHasil);
      const h = evaluasiAutentikasi(jawaban.p, jawaban.q, jawaban.r, jawaban.s);
      hasilSekarang = h;
      await bicara(I.hasil[h.kode].teks);
      tampilHasil(h);

      // 4. Tunggu pengguna mengulang
      await new Promise((selesai) => { btnUlang.onclick = selesai; });
    }
  }

  jalan();
})();
