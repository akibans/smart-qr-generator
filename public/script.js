/* =====================================================
   SMART QR GENERATOR — FINAL STABLE SCRIPT
   Author: Akib Ansari
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("qrForm");
  const input = document.getElementById("url");
  const button = document.getElementById("generateBtn");
  const error = document.getElementById("error");

  const preview = document.getElementById("preview");
  const qrImage = document.getElementById("qrImage");
  const downloadBtn = document.getElementById("downloadBtn");

  /* ===============================
     EVENT HANDLING (NO BLINK)
  ================================ */

  // Mouse click
  button.addEventListener("click", generateQR);

  // Enter key (input focused)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      generateQR();
    }
  });

  /* ===============================
     URL NORMALIZATION
  ================================ */
  function normalizeURL(value) {
    let url = value.trim().toLowerCase();

    if (url.startsWith("www.")) {
      url = "https://" + url;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    return url;
  }

  /* ===============================
     STRICT URL VALIDATION
  ================================ */
  function isValidURL(url) {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;

      // Must contain dot
      if (!hostname.includes(".")) return false;

      // Reject pure numbers (123, 111.222)
      if (/^\d+(\.\d+)*$/.test(hostname)) return false;

      const parts = hostname.split(".");
      const tld = parts[parts.length - 1];

      // TLD must be letters only (2–10 chars)
      if (!/^[a-z]{2,10}$/.test(tld)) return false;

      // Each part must contain at least one letter
      for (const part of parts) {
        if (!/[a-z]/.test(part)) return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /* ===============================
     MAIN FUNCTION
  ================================ */
  async function generateQR() {
    error.textContent = "";
    preview.classList.add("hidden");

    const userInput = input.value.trim();

    if (!userInput) {
      error.textContent = "Please enter a website URL.";
      return;
    }

    const finalURL = normalizeURL(userInput);

    if (!isValidURL(finalURL)) {
      error.textContent = "Enter a valid website like google.com";
      return;
    }

    try {
      button.classList.add("loading");
      button.textContent = "Generating...";

      const response = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalURL })
      });

      if (!response.ok) {
        throw new Error("QR generation failed");
      }

      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);

      qrImage.src = objectURL;
      downloadBtn.href = objectURL;
      preview.classList.remove("hidden");

    } catch (err) {
      error.textContent = "Something went wrong. Please try again.";
      console.error(err);
    } finally {
      button.classList.remove("loading");
      button.textContent = "Generate QR";
    }
  }
});
