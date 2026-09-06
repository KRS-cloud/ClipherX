/**
 * CipherX — Educational Cipher Engine & UI Simulator
 * Implements 10 deterministic, fully invertible character transformations.
 */

(function () {
  "use strict";

  /* =========================================================================
   * 1. ALGORITHM REGISTRY & CORE TRANSFORMATIONS
   * ========================================================================= */

  // Algorithm 1 Substitution Character Maps
  const A1_SRC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?:;@#$%&*+-=_";
  const A1_TGT = "Ω≈ç√∫˜µ≤≥÷≠±§¶•ªº!@#$%^&*()_+~`|}{[]:;?><,./'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567";

  // Algorithm 2 Mixed Character Substitution Maps
  const A2_SRC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?:;-+";
  const A2_TGT = "qAzWsXeDcRfVtGbYhNuJmIkOlP1098765432!@#$%^&*()_+~`-=[]{}|;:,.<>?/ZYXWVUT";

  // Predefined Sample Datasets
  const SAMPLE_PROMPTS = [
    "Meet me at 8:30 PM.",
    "Welcome Pankaj",
    "Hello World! 123",
    "Encryption @ Home #2026",
    "Classical ciphers are deterministic permutations.",
    "Zero bugs found in the pipeline!"
  ];

  const algorithms = {
    1: {
      id: 1,
      name: "Algorithm 1 — Symbol Substitution Cipher",
      type: "Monoalphabetic Substitution",
      reversible: "Bijective / Invertible",
      difficulty: "Beginner",
      description: "Direct one-to-one character mapping between an alphanumeric set and an invariant symbol table.",
      sample: "CIPHER",
      encrypt: (txt) => substitute(txt, A1_SRC, A1_TGT),
      decrypt: (txt) => substitute(txt, A1_TGT, A1_SRC)
    },
    2: {
      id: 2,
      name: "Algorithm 2 — Mixed Character Substitution",
      type: "Poly-Domain Substitution",
      reversible: "Bijective / Invertible",
      difficulty: "Beginner",
      description: "Applies a keyed non-linear mapping interweaving inverted casings, numerals, and special characters.",
      sample: "NETWORK",
      encrypt: (txt) => substitute(txt, A2_SRC, A2_TGT),
      decrypt: (txt) => substitute(txt, A2_TGT, A2_SRC)
    },
    3: {
      id: 3,
      name: "Algorithm 3 — Caesar Shift (k = 3)",
      type: "Rotational Modular Shift",
      reversible: "Yes (Modulo 26)",
      difficulty: "Beginner",
      description: "Classical Caesar rotational shift with key k=3. Rotates upper and lower letters independently, leaving non-letters unchanged.",
      sample: "ATTACK",
      encrypt: (txt) => shiftCaesar(txt, 3),
      decrypt: (txt) => shiftCaesar(txt, -3)
    },
    4: {
      id: 4,
      name: "Algorithm 4 — Atbash / Reverse Alphabet",
      type: "Reflection Cipher",
      reversible: "Involution (Self-Inverting)",
      difficulty: "Beginner",
      description: "Maps each letter to its reciprocal opposite in standard alphabetic order (A<->Z, B<->Y). Executing twice restores original text.",
      sample: "SECRET",
      encrypt: (txt) => atbash(txt),
      decrypt: (txt) => atbash(txt)
    },
    5: {
      id: 5,
      name: "Algorithm 5 — Numeric Cipher (Delimited)",
      type: "Character-to-Decimal Encoding",
      reversible: "Structured Parser",
      difficulty: "Intermediate",
      description: "Encodes every character code into a padded 3-digit decimal sequence separated by hyphens.",
      sample: "HELLO",
      encrypt: (txt) => encodeNumeric(txt),
      decrypt: (txt) => decodeNumeric(txt)
    },
    6: {
      id: 6,
      name: "Algorithm 6 — ASCII Mathematical Offset (+7)",
      type: "Homomorphic Modular Offset",
      reversible: "Additive Inverse",
      difficulty: "Intermediate",
      description: "Shifts character byte indices across the printable ASCII range [32 to 126] using a cyclic modulus boundary.",
      sample: "STATION",
      encrypt: (txt) => asciiOffset(txt, 7),
      decrypt: (txt) => asciiOffset(txt, -7)
    },
    7: {
      id: 7,
      name: "Algorithm 7 — Position-Based Index Shift",
      type: "Polyalphabetic Linear Shift",
      reversible: "Index Inversion",
      difficulty: "Intermediate",
      description: "Applies a non-repeating shift derived dynamically from character positional indices: char[i] shifted by (i + 1).",
      sample: "PARALLEL",
      encrypt: (txt) => positionShift(txt, true),
      decrypt: (txt) => positionShift(txt, false)
    },
    8: {
      id: 8,
      name: "Algorithm 8 — Adjacent Pair-Swap",
      type: "Permutation / Transposition",
      reversible: "Involution (Self-Inverting)",
      difficulty: "Intermediate",
      description: "Exchanges adjacent character pairs (indices 2n and 2n+1). Preserves dangling odd terminal elements safely.",
      sample: "TRANSPOSITION",
      encrypt: (txt) => pairSwap(txt),
      decrypt: (txt) => pairSwap(txt)
    },
    9: {
      id: 9,
      name: "Algorithm 9 — Hexadecimal XOR Transformation",
      type: "Binary Stream XOR Simulation",
      reversible: "Symmetric XOR Identity",
      difficulty: "Intermediate",
      description: "Combines character ASCII bytes with a fixed single-byte key (0x5A) via bitwise XOR, serialized cleanly as hex octets.",
      sample: "KEYSTORE",
      encrypt: (txt) => xorHex(txt, 0x5A),
      decrypt: (txt) => xorUnhex(txt, 0x5A)
    },
    10: {
      id: 10,
      name: "Algorithm 10 — Multi-Step Inversion Pipeline",
      type: "Product Cipher (Compound)",
      reversible: "Strict Inverted Order",
      difficulty: "Advanced",
      description: "Executes a three-phase compound pipeline: Sequence Inversion -> Caesar Rotation (+5) -> Base Substitution. Reverses in exact opposite order.",
      sample: "ENTERPRISE",
      encrypt: (txt) => multiStepEncrypt(txt),
      decrypt: (txt) => multiStepDecrypt(txt)
    }
  };

  /* =========================================================================
   * 2. TRANSFORMATION IMPLEMENTATIONS
   * ========================================================================= */

  // Substitution Helper
  function substitute(text, fromMap, toMap) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const idx = fromMap.indexOf(ch);
      result += idx !== -1 ? toMap[idx] : ch;
    }
    return result;
  }

  // Algorithm 3: Caesar Shift
  function shiftCaesar(text, shift) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        // Uppercase
        result += String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
      } else if (code >= 97 && code <= 122) {
        // Lowercase
        result += String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
      } else {
        result += text[i];
      }
    }
    return result;
  }

  // Algorithm 4: Atbash
  function atbash(text) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        result += String.fromCharCode(90 - (code - 65));
      } else if (code >= 97 && code <= 122) {
        result += String.fromCharCode(122 - (code - 97));
      } else {
        result += text[i];
      }
    }
    return result;
  }

  // Algorithm 5: Delimited Numeric Cipher
  function encodeNumeric(text) {
    if (!text) return "";
    const segments = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      segments.push(code.toString().padStart(3, "0"));
    }
    return segments.join("-");
  }

  function decodeNumeric(text) {
    if (!text.trim()) return "";
    const segments = text.split("-");
    let result = "";
    for (const segment of segments) {
      if (!/^\d+$/.test(segment)) {
        throw new Error("Invalid numeric format: Contains malformed non-decimal segment.");
      }
      const code = parseInt(segment, 10);
      result += String.fromCharCode(code);
    }
    return result;
  }

  // Algorithm 6: ASCII Printable Offset
  function asciiOffset(text, offset) {
    const MIN = 32;
    const MAX = 126;
    const RANGE = MAX - MIN + 1;
    let result = "";

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= MIN && code <= MAX) {
        const shifted = ((code - MIN + offset) % RANGE + RANGE) % RANGE + MIN;
        result += String.fromCharCode(shifted);
      } else {
        result += text[i];
      }
    }
    return result;
  }

  // Algorithm 7: Position-Based Shift
  function positionShift(text, isEncrypt) {
    const MIN = 32;
    const MAX = 126;
    const RANGE = MAX - MIN + 1;
    let result = "";

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= MIN && code <= MAX) {
        const delta = (i + 1) % RANGE;
        const shift = isEncrypt ? delta : -delta;
        const mapped = ((code - MIN + shift) % RANGE + RANGE) % RANGE + MIN;
        result += String.fromCharCode(mapped);
      } else {
        result += text[i];
      }
    }
    return result;
  }

  // Algorithm 8: Adjacent Pair-Swap
  function pairSwap(text) {
    const chars = text.split("");
    for (let i = 0; i < chars.length - 1; i += 2) {
      const tmp = chars[i];
      chars[i] = chars[i + 1];
      chars[i + 1] = tmp;
    }
    return chars.join("");
  }

  // Algorithm 9: XOR Hex Cipher
  function xorHex(text, key) {
    let hexResult = "";
    for (let i = 0; i < text.length; i++) {
      const xored = text.charCodeAt(i) ^ key;
      hexResult += xored.toString(16).padStart(2, "0");
    }
    return hexResult.toUpperCase();
  }

  function xorUnhex(hexText, key) {
    const cleanHex = hexText.trim();
    if (cleanHex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(cleanHex)) {
      throw new Error("Invalid ciphertext: XOR representation must be even-length hex octets.");
    }
    let result = "";
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byteVal = parseInt(cleanHex.substr(i, 2), 16);
      result += String.fromCharCode(byteVal ^ key);
    }
    return result;
  }

  // Algorithm 10: Multi-Step Pipeline
  function multiStepEncrypt(text) {
    // 1. String reversal
    const reversed = text.split("").reverse().join("");
    // 2. Caesar shift (+5)
    const shifted = shiftCaesar(reversed, 5);
    // 3. Substitution pass
    return substitute(shifted, A1_SRC, A1_TGT);
  }

  function multiStepDecrypt(text) {
    // Inverse 3. Reverse substitution pass
    const unsub = substitute(text, A1_TGT, A1_SRC);
    // Inverse 2. Caesar shift (-5)
    const unshifted = shiftCaesar(unsub, -5);
    // Inverse 1. String reversal
    return unshifted.split("").reverse().join("");
  }

  /* =========================================================================
   * 3. DOM ELEMENT REFERENCES
   * ========================================================================= */

  const plainTextInput = document.getElementById("plainTextInput");
  const cipherOutputA = document.getElementById("cipherOutputA");
  const algoSelectA = document.getElementById("algoSelectA");
  const btnEncrypt = document.getElementById("btnEncrypt");
  const btnVerify = document.getElementById("btnVerify");
  const btnClearA = document.getElementById("btnClearA");
  const btnCopyA = document.getElementById("btnCopyA");
  const btnSendToB = document.getElementById("btnSendToB");
  const btnRandomMessage = document.getElementById("btnRandomMessage");
  const charCountA = document.getElementById("charCountA");
  const statusA = document.getElementById("statusA");

  const cipherInputB = document.getElementById("cipherInputB");
  const plainOutputB = document.getElementById("plainOutputB");
  const algoSelectB = document.getElementById("algoSelectB");
  const btnDecrypt = document.getElementById("btnDecrypt");
  const btnClearB = document.getElementById("btnClearB");
  const btnCopyB = document.getElementById("btnCopyB");
  const charCountB = document.getElementById("charCountB");
  const statusB = document.getElementById("statusB");

  const infoTitle = document.getElementById("infoTitle");
  const infoDesc = document.getElementById("infoDesc");
  const infoType = document.getElementById("infoType");
  const infoReversible = document.getElementById("infoReversible");
  const infoDifficulty = document.getElementById("infoDifficulty");

  const demoInput = document.getElementById("demoInput");
  const demoEncrypted = document.getElementById("demoEncrypted");
  const demoDecrypted = document.getElementById("demoDecrypted");

  const historyTableBody = document.getElementById("historyTableBody");
  const btnClearHistory = document.getElementById("btnClearHistory");
  const btnClearAll = document.getElementById("btnClearAll");

  /* =========================================================================
   * 4. UI STATE CONTROLLER & NOTIFICATIONS
   * ========================================================================= */

  function showStatus(targetEl, message, level) {
    targetEl.className = `status-banner show ${level}`;
    targetEl.textContent = message;
    targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearStatus(targetEl) {
    targetEl.className = "status-banner";
    targetEl.textContent = "";
  }

  function updateCharCount(inputElement, counterElement) {
    counterElement.textContent = `Characters: ${inputElement.value.length}`;
  }

  function updateAlgorithmPanels(algoId) {
    const spec = algorithms[algoId];
    if (!spec) return;

    infoTitle.textContent = spec.name;
    infoDesc.textContent = spec.description;
    infoType.textContent = spec.type;
    infoReversible.textContent = spec.reversible;
    infoDifficulty.textContent = spec.difficulty;

    // Refresh Live Demo Card
    demoInput.textContent = spec.sample;
    try {
      const enc = spec.encrypt(spec.sample);
      demoEncrypted.textContent = enc;
      demoDecrypted.textContent = spec.decrypt(enc);
    } catch {
      demoEncrypted.textContent = "Err";
      demoDecrypted.textContent = "Err";
    }
  }

  /* =========================================================================
   * 5. BUSINESS LOGIC & DISPATCHERS
   * ========================================================================= */

  function handleEncrypt() {
    clearStatus(statusA);
    const plain = plainTextInput.value;
    if (!plain) {
      showStatus(statusA, "Please enter a message to encrypt.", "warning");
      return;
    }

    const algoId = parseInt(algoSelectA.value, 10);
    const algo = algorithms[algoId];

    try {
      const cipherText = algo.encrypt(plain);
      cipherOutputA.value = cipherText;
      showStatus(statusA, "Message encrypted successfully.", "success");
      saveHistoryEntry(algo.name, cipherText);
    } catch (err) {
      showStatus(statusA, `Encryption failed: ${err.message}`, "error");
    }
  }

  function handleDecrypt() {
    clearStatus(statusB);
    const cipher = cipherInputB.value;
    if (!cipher) {
      showStatus(statusB, "Please paste an encrypted message.", "warning");
      return;
    }

    const algoId = parseInt(algoSelectB.value, 10);
    const algo = algorithms[algoId];

    try {
      const recovered = algo.decrypt(cipher);
      plainOutputB.value = recovered;
      showStatus(statusB, "Message decrypted successfully.", "success");
    } catch {
      plainOutputB.value = "";
      showStatus(
        statusB,
        "Unable to recover original message. Check that the algorithm matches User A.",
        "error"
      );
    }
  }

  function handleVerify() {
    clearStatus(statusA);
    const plain = plainTextInput.value;
    if (!plain) {
      showStatus(statusA, "Enter plaintext before verifying.", "warning");
      return;
    }

    const algoId = parseInt(algoSelectA.value, 10);
    const algo = algorithms[algoId];

    try {
      const enc = algo.encrypt(plain);
      const dec = algo.decrypt(enc);
      if (dec === plain) {
        showStatus(statusA, `\u2713 Encryption verified: Cycle matched original string perfectly.`, "success");
      } else {
        showStatus(statusA, `\u2715 Verification failed: Output string mismatch.`, "error");
      }
    } catch (err) {
      showStatus(statusA, `Verification error: ${err.message}`, "error");
    }
  }

  function handleSendToB() {
    const cipherText = cipherOutputA.value;
    if (!cipherText) {
      showStatus(statusA, "No encrypted ciphertext available to send. Run encryption first.", "warning");
      return;
    }

    cipherInputB.value = cipherText;
    algoSelectB.value = algoSelectA.value;
    updateCharCount(cipherInputB, charCountB);
    clearStatus(statusB);
    showStatus(statusB, "Payload transferred from User A. Ready to decrypt.", "success");
  }

  function handleCopy(textAreaElement, buttonElement) {
    const text = textAreaElement.value;
    if (!text) return;

    navigator.clipboard.writeText(text).then(
      () => {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = "Copied!";
        setTimeout(() => {
          buttonElement.textContent = originalText;
        }, 1500);
      },
      () => {
        alert("Clipboard write operation failed. Please copy manually.");
      }
    );
  }

  function handleRandomMessage() {
    const randomIndex = Math.floor(Math.random() * SAMPLE_PROMPTS.length);
    plainTextInput.value = SAMPLE_PROMPTS[randomIndex];
    updateCharCount(plainTextInput, charCountA);
    clearStatus(statusA);
  }

  /* =========================================================================
   * 6. LOCAL STORAGE HISTORY
   * ========================================================================= */

  const STORAGE_KEY = "cipherx_history_records";

  function getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveHistoryEntry(algoName, ciphertext) {
    try {
      const records = getHistory();
      const newEntry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        algo: algoName,
        cipher: ciphertext
      };
      records.unshift(newEntry);
      // Keep only recent 10 records
      if (records.length > 10) records.pop();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      renderHistory();
    } catch {
      // Storage unavailable or quota reached
    }
  }

  function renderHistory() {
    const records = getHistory();
    historyTableBody.innerHTML = "";

    if (records.length === 0) {
      historyTableBody.innerHTML = '<tr><td colspan="4" class="empty-state">No past session records available.</td></tr>';
      return;
    }

    records.forEach((rec) => {
      const row = document.createElement("tr");

      const timeTd = document.createElement("td");
      timeTd.textContent = rec.time;

      const algoTd = document.createElement("td");
      algoTd.textContent = rec.algo;

      const cipherTd = document.createElement("td");
      const snippet = rec.cipher.length > 25 ? `${rec.cipher.substring(0, 25)}...` : rec.cipher;
      cipherTd.innerHTML = `<code>${escapeHtml(snippet)}</code>`;

      const actionTd = document.createElement("td");
      const loadBtn = document.createElement("button");
      loadBtn.className = "btn btn-secondary btn-sm";
      loadBtn.textContent = "Load to B";
      loadBtn.onclick = () => {
        cipherInputB.value = rec.cipher;
        updateCharCount(cipherInputB, charCountB);
        // Synchronize algorithm if match found
        for (const [id, spec] of Object.entries(algorithms)) {
          if (spec.name === rec.algo) {
            algoSelectB.value = id;
            break;
          }
        }
        showStatus(statusB, "Payload loaded into User B from journal.", "success");
      };
      actionTd.appendChild(loadBtn);

      row.appendChild(timeTd);
      row.appendChild(algoTd);
      row.appendChild(cipherTd);
      row.appendChild(actionTd);
      historyTableBody.appendChild(row);
    });
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =========================================================================
   * 7. EVENT LISTENERS & INITIALIZATION
   * ========================================================================= */

  // Text Area Input Trackers
  plainTextInput.addEventListener("input", () => updateCharCount(plainTextInput, charCountA));
  cipherInputB.addEventListener("input", () => updateCharCount(cipherInputB, charCountB));

  // Algorithm Select Switchers
  algoSelectA.addEventListener("change", (e) => {
    updateAlgorithmPanels(e.target.value);
    clearStatus(statusA);
  });
  algoSelectB.addEventListener("change", () => clearStatus(statusB));

  // Buttons User A
  btnEncrypt.addEventListener("click", handleEncrypt);
  btnVerify.addEventListener("click", handleVerify);
  btnSendToB.addEventListener("click", handleSendToB);
  btnRandomMessage.addEventListener("click", handleRandomMessage);
  btnCopyA.addEventListener("click", () => handleCopy(cipherOutputA, btnCopyA));
  btnClearA.addEventListener("click", () => {
    plainTextInput.value = "";
    cipherOutputA.value = "";
    updateCharCount(plainTextInput, charCountA);
    clearStatus(statusA);
  });

  // Buttons User B
  btnDecrypt.addEventListener("click", handleDecrypt);
  btnCopyB.addEventListener("click", () => handleCopy(plainOutputB, btnCopyB));
  btnClearB.addEventListener("click", () => {
    cipherInputB.value = "";
    plainOutputB.value = "";
    updateCharCount(cipherInputB, charCountB);
    clearStatus(statusB);
  });

  // History & Global Reset
  btnClearHistory.addEventListener("click", clearHistory);
  btnClearAll.addEventListener("click", () => {
    plainTextInput.value = "";
    cipherOutputA.value = "";
    cipherInputB.value = "";
    plainOutputB.value = "";
    updateCharCount(plainTextInput, charCountA);
    updateCharCount(cipherInputB, charCountB);
    clearStatus(statusA);
    clearStatus(statusB);
    clearHistory();
  });

  // Initial Boot
  updateAlgorithmPanels(algoSelectA.value);
  renderHistory();
})();