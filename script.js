// COMMON DOM refs
const video = document.getElementById("video");
const countdownEl = document.getElementById("countdown");
const startBtn = document.getElementById("startBtn");
const liveStrip = document.getElementById("liveStrip");
const overlay = document.getElementById("overlay");
const retakeBtn = document.getElementById("retakeBtn");
const continueBtn = document.getElementById("continueBtn");

// ========== CAMERA / BOOTH ==========
if (video) {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
      video.srcObject = stream;
      video.play().catch(() => { });
    })
    .catch(() => alert("Camera access denied 😭"));
}

if (startBtn) {
  startBtn.addEventListener("click", async () => {
    if (!video || !liveStrip || !countdownEl) return;

    const photos = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 720;
    canvas.height = 540;

    
    // lil message before countdown starts 🥹
countdownEl.textContent = "okay!! smileeeee";
await new Promise(r => setTimeout(r, 1500)); // show it for 1s


    for (let i = 0; i < 4; i++) {
      for (let j = 3 ; j > 0; j--) {
        countdownEl.textContent = j;
        await new Promise(r => setTimeout(r, 700));
      }
      countdownEl.textContent = "";

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const photoData = canvas.toDataURL("image/png");
      photos.push(photoData);

      const wrapper = document.createElement("div");
      wrapper.className = "thumb-wrap";
      const thumb = document.createElement("img");
      thumb.src = photoData;
      setTimeout(() => thumb.classList.add("visible"), 20);
      wrapper.appendChild(thumb);
      liveStrip.appendChild(wrapper);

      await new Promise(r => setTimeout(r, 500));
    }

    localStorage.setItem("photos", JSON.stringify(photos));
    overlay.classList.remove("hidden");
  });
}

// Overlay buttons
if (retakeBtn) {
  retakeBtn.addEventListener("click", () => {
    localStorage.removeItem("photos");
    overlay.classList.add("hidden");
    liveStrip.innerHTML = "";
  });
}

if (continueBtn) {
  continueBtn.addEventListener("click", () => {
    document.body.style.transition = "opacity 0.35s ease";
    document.body.style.opacity = "0";
    setTimeout(() => { window.location.href = "editor.html"; }, 350);
  });
}

// ========== EDITOR PAGE ==========
(function setupEditor() {
  const editorStrip = document.getElementById("editorStrip");
  if (!editorStrip) return;

  // load images
  const photos = JSON.parse(localStorage.getItem("photos")) || [];
  editorStrip.innerHTML = "";
  photos.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    editorStrip.appendChild(img);
  });

  // watermark text
  editorStrip.dataset.bottomText = "INDIGO PHOTOBOOTH 🦋";

  // filters
  document.querySelectorAll(".filter-controls button").forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      editorStrip.querySelectorAll("img").forEach(img => {
        img.classList.remove("filter-bw", "filter-warm", "filter-cool", "filter-grain");
        if (filter !== "none") img.classList.add(`filter-${filter}`);
      });
    });
  });

  // frames
  document.querySelectorAll(".color-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      const color = dot.dataset.frame;
      editorStrip.className = `photo-strip-vertical ${color}`;
    });
  });

  // bottom design toggle (optional)
  const toggleBottom = document.getElementById("toggleBottom");
  if (toggleBottom) {
    toggleBottom.addEventListener("click", () => {
      editorStrip.classList.toggle("bottom-design");
    });
  }

  // ========== DOWNLOAD STRIP ==========
const panel = document.querySelector(".control-panel");
if (panel) {
  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "Download Strip 📸";
  downloadBtn.id = "downloadStripBtn";
  panel.appendChild(downloadBtn);

  downloadBtn.addEventListener("click", () => {
    const strip = document.getElementById("editorStrip");

    html2canvas(strip, {
      backgroundColor: null,
      scale: 2, // keeps crisp quality
      width: strip.offsetWidth,
      height: strip.offsetHeight,
      useCORS: true
    }).then(canvas => {
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.download = `INDIGO_${date}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
}
})();
// custom bottom text input
const bottomInput = document.getElementById("bottomTextInput");
const applyBottomText = document.getElementById("applyBottomText");

if (bottomInput && applyBottomText) {
  applyBottomText.addEventListener("click", () => {
    const text = bottomInput.value.trim();
    const editorStrip = document.getElementById("editorStrip");
    if (!editorStrip) return;

    // if user typed smth, set it as the strip's data attribute
    if (text) {
      editorStrip.dataset.bottomText = text;
      editorStrip.classList.add("bottom-design");
    } else {
      editorStrip.dataset.bottomText = "INDIGO PHOTOBOOTH 🦋"; // default
      editorStrip.classList.add("bottom-design");
    }
  });
}
