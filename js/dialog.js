/**
 * ============================================================
 * ENGINE DIALOG GAME & PENGENDALI HUD PROPOSISI (B / T)
 * ============================================================
 */

(function () {
  let stateData = buatDataAwal();
  let currentStepId = "intro";
  let typingTimer = null;
  let fullTextBuffer = "";
  let isTyping = false;

  // Referensi elemen DOM
  const elProgressCounter = document.getElementById("progress-counter");
  const elProgressTrack = document.getElementById("progress-track");
  const elProgressFill = document.getElementById("progress-fill");
  const elHudDevice = document.getElementById("hud-device");

  const elDialogBox = document.getElementById("dialog-box");
  const elDialogContent = document.getElementById("dialog-content");
  const elDialogText = document.getElementById("dialog-text");
  const elTypingCursor = document.getElementById("typing-cursor");
  const elChoicesList = document.getElementById("choices-list");

  const elResultPanel = document.getElementById("result-panel");
  const elResultMethod = document.getElementById("result-method");
  const elResultBody = document.getElementById("result-body");
  const btnRestart = document.getElementById("btn-restart");

  // Definisi alur dialog (termasuk kalimat pembuka sesuai konsep UI)
  const DIALOG_NODES = {
    intro: {
      stepLabel: "Prolog",
      percent: 0,
      activeProp: null,
      text: "Hahaha, apa kau ingin tau autentikasi sesuai keadaanmu?",
      choices: [
        {
          label: "Iya, mau",
          next: "step_device",
        },
        {
          label: "Engga deh",
          next: "declined",
        },
      ],
    },

    declined: {
      stepLabel: "Prolog",
      percent: 0,
      activeProp: null,
      text: "Yakin nih? Padahal salah memilih metode autentikasi bisa bikin akunmu rawan dibobol. Mau coba evaluasi sekarang?",
      choices: [
        {
          label: "Oke deh, ayo mulai!",
          next: "step_device",
        },
        {
          label: "Kembali ke awal",
          next: "intro",
        },
      ],
    },

    step_device: {
      stepLabel: "Tahap 1/5",
      percent: 20,
      activeProp: null,
      text: "Bagus! Pertama, pilih jenis perangkat yang sedang kamu gunakan saat ini:",
      choices: [
        {
          label: "Smartphone",
          action: () => {
            stateData.jenisPerangkat = 1;
          },
          next: "step_H",
        },
        {
          label: "Laptop / Komputer",
          action: () => {
            stateData.jenisPerangkat = 2;
          },
          next: "step_H",
        },
        {
          label: "Tablet",
          action: () => {
            stateData.jenisPerangkat = 3;
          },
          next: "step_H",
        },
        {
          label: "Perangkat lainnya",
          action: () => {
            stateData.jenisPerangkat = 4;
          },
          next: "step_H",
        },
      ],
    },

    step_H: {
      stepLabel: "Tahap 2/5",
      percent: 40,
      activeProp: "H",
      text: "Sekarang kita uji proposisi H (Risiko Tinggi): Apakah risiko akses saat ini tergolong tinggi?",
      choices: [
        {
          label: "Ya, risiko akses tinggi",
          action: () => {
            stateData.risikoTinggi = true;
          },
          next: "step_U",
        },
        {
          label: "Tidak, risiko akses aman/normal",
          action: () => {
            stateData.risikoTinggi = false;
          },
          next: "step_U",
        },
      ],
    },

    step_U: {
      stepLabel: "Tahap 3/5",
      percent: 60,
      activeProp: "U",
      text: "Lanjut ke proposisi U (Perangkat Asing): Apakah perangkat yang kamu pakai ini tidak dikenal oleh sistem?",
      choices: [
        {
          label: "Ya, perangkat tidak dikenal",
          action: () => {
            stateData.perangkatTidakDikenal = true;
          },
          next: "step_S",
        },
        {
          label: "Tidak, perangkat sudah dikenal",
          action: () => {
            stateData.perangkatTidakDikenal = false;
          },
          next: "step_S",
        },
      ],
    },

    step_S: {
      stepLabel: "Tahap 4/5",
      percent: 80,
      activeProp: "S",
      text: "Berikutnya proposisi S (Data Sensitif): Apakah kamu sedang mengakses data atau layanan yang sensitif?",
      choices: [
        {
          label: "Ya, mengakses data sensitif",
          action: () => {
            stateData.aksesSensitif = true;
          },
          next: "step_K",
        },
        {
          label: "Tidak, hanya data biasa",
          action: () => {
            stateData.aksesSensitif = false;
          },
          next: "step_K",
        },
      ],
    },

    step_K: {
      stepLabel: "Tahap 5/5",
      percent: 95,
      activeProp: "K",
      text: "Terakhir, proposisi K (Kompatibilitas): Apakah perangkatmu mendukung fitur Passkey?",
      choices: [
        {
          label: "Ya, mendukung Passkey",
          action: () => {
            stateData.mendukungPasskey = true;
          },
          next: "finished",
        },
        {
          label: "Tidak mendukung Passkey",
          action: () => {
            stateData.mendukungPasskey = false;
          },
          next: "finished",
        },
      ],
    },

    finished: {
      stepLabel: "Selesai",
      percent: 100,
      activeProp: null,
      text: "Evaluasi logika proposisi selesai! Lihat hasil rekomendasi autentikasi di atas.",
      choices: [],
    },
  };

  /**
   * Mengubah nilai boolean menjadi badge 'B' (Benar) atau 'T' (Tidak)
   */
  function renderTruthBadge(elementId, value) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.classList.remove("pending", "truth-B", "truth-T");

    if (value === true) {
      el.textContent = "B";
      el.classList.add("truth-B");
    } else if (value === false) {
      el.textContent = "T";
      el.classList.add("truth-T");
    } else {
      el.textContent = "?";
      el.classList.add("pending");
    }
  }

  /**
   * Memperbarui seluruh HUD atas (Progress Bar, Perangkat, dan Nilai B/T tiap proposisi)
   */
  function updateHud(node) {
    // 1. Progress bar
    elProgressCounter.textContent = `${node.stepLabel} • ${node.percent}%`;
    elProgressTrack.setAttribute("aria-valuenow", String(node.percent));
    elProgressFill.style.width = `${node.percent}%`;

    // 2. Nama perangkat
    elHudDevice.textContent =
      stateData.jenisPerangkat !== null
        ? NAMA_PERANGKAT[stateData.jenisPerangkat]
        : "Belum dipilih";

    // 3. Highlight kartu proposisi yang sedang aktif ditanyakan
    ["H", "U", "S", "K"].forEach((sym) => {
      const card = document.getElementById(`prop-card-${sym}`);
      if (card) {
        card.classList.toggle("active-question", node.activeProp === sym);
      }
    });

    // 4. Evaluasi logika & tampilkan B / T di bawah simbol proposisi
    const hasil = evaluasiLogika(stateData);
    renderTruthBadge("truth-H", hasil.H);
    renderTruthBadge("truth-U", hasil.U);
    renderTruthBadge("truth-S", hasil.S);
    renderTruthBadge("truth-K", hasil.K);

    renderTruthBadge("truth-M", hasil.M);
    renderTruthBadge("truth-B", hasil.B);
    renderTruthBadge("truth-P", hasil.P);

    // Highlight rumus output yang bernilai B (Benar)
    document.getElementById("derived-M")?.classList.toggle("active-result", hasil.M === true);
    document.getElementById("derived-B")?.classList.toggle("active-result", hasil.B === true);
    document.getElementById("derived-P")?.classList.toggle("active-result", hasil.P === true);
  }

  /**
   * Efek mesin ketik (typewriter) untuk teks dialog
   */
  function typeDialogText(text, onComplete) {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }

    fullTextBuffer = text;
    elDialogText.textContent = "";
    elTypingCursor.classList.remove("done");
    isTyping = true;

    let idx = 0;
    typingTimer = setInterval(() => {
      idx += 1;
      elDialogText.textContent = fullTextBuffer.slice(0, idx);

      if (idx >= fullTextBuffer.length) {
        clearInterval(typingTimer);
        typingTimer = null;
        isTyping = false;
        elTypingCursor.classList.add("done");
        if (onComplete) onComplete();
      }
    }, 20);
  }

  function finishTypingImmediately() {
    if (!isTyping) return;
    clearInterval(typingTimer);
    typingTimer = null;
    isTyping = false;
    elDialogText.textContent = fullTextBuffer;
    elTypingCursor.classList.add("done");
  }

  /**
   * Merender panel hasil evaluasi lengkap saat semua pertanyaan terjawab
   */
  function showFinalResult() {
    const hasil = evaluasiLogika(stateData);
    const detail = buatDetailRekomendasi(stateData, hasil);

    elDialogBox.classList.add("hidden");
    elResultPanel.classList.remove("hidden");

    elResultMethod.textContent = detail.judul;
    elResultMethod.className = `result-method mode-${detail.kode}`;

    const labelBT = (val) => (val ? "B (Benar)" : "T (Tidak)");

    elResultBody.innerHTML = `
      <div class="result-block">
        <h3>Ringkasan Input &amp; Proposisi</h3>
        <ul>
          <li>Perangkat: <strong>${NAMA_PERANGKAT[stateData.jenisPerangkat]}</strong></li>
          <li><strong>H</strong> (Risiko tinggi): <strong>${labelBT(hasil.H)}</strong></li>
          <li><strong>U</strong> (Perangkat asing): <strong>${labelBT(hasil.U)}</strong></li>
          <li><strong>S</strong> (Data sensitif): <strong>${labelBT(hasil.S)}</strong></li>
          <li><strong>K</strong> (Passkey valid): <strong>${labelBT(hasil.K)}</strong></li>
        </ul>
      </div>

      <div class="result-block">
        <h3>Evaluasi Rumus Proposisi</h3>
        <ul>
          <li><strong>M = H ∨ U ∨ S</strong> : <strong>${labelBT(hasil.M)}</strong></li>
          <li><strong>B = ¬M ∧ K</strong> : <strong>${labelBT(hasil.B)}</strong></li>
          <li><strong>P = ¬M ∧ ¬K</strong> : <strong>${labelBT(hasil.P)}</strong></li>
        </ul>
      </div>

      <div class="result-block">
        <h3>Alasan &amp; Contoh Metode</h3>
        <ul>
          ${detail.alasan.map((item) => `<li>${item}</li>`).join("")}
          <li><strong>Contoh metode:</strong> ${detail.contohMetode}</li>
        </ul>
      </div>
    `;
  }

  /**
   * Berpindah ke node dialog tertentu
   */
  function goToNode(nodeId) {
    currentStepId = nodeId;
    const node = DIALOG_NODES[nodeId];
    if (!node) return;

    updateHud(node);

    if (nodeId === "finished") {
      showFinalResult();
      return;
    }

    elResultPanel.classList.add("hidden");
    elDialogBox.classList.remove("hidden");
    elChoicesList.innerHTML = "";

    typeDialogText(node.text);

    node.choices.forEach((choice, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.innerHTML = `
        <span>${choice.label}</span>
        <span class="choice-key">${index + 1}</span>
      `;

      btn.addEventListener("click", () => {
        if (choice.action) choice.action();
        goToNode(choice.next);
      });

      elChoicesList.appendChild(btn);
    });
  }

  /**
   * Reset permainan & seluruh proposisi
   */
  function resetGame() {
    stateData = buatDataAwal();
    goToNode("intro");
  }

  // Klik kotak dialog untuk skip animasi ketik
  elDialogContent.addEventListener("click", finishTypingImmediately);

  // Dukungan shortcut keyboard (1-4 untuk memilih jawaban, Space/Enter untuk skip ketik)
  document.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      if (isTyping) {
        e.preventDefault();
        finishTypingImmediately();
        return;
      }
    }

    const num = parseInt(e.key, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= 4) {
      const buttons = elChoicesList.querySelectorAll(".choice-btn");
      if (buttons[num - 1]) {
        buttons[num - 1].click();
      }
    }
  });

  btnRestart.addEventListener("click", resetGame);

  // Mulai game saat halaman dimuat
  resetGame();
})();
