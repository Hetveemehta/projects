// CAMERA PAGE
const video = document.getElementById("video");
const countdownEl = document.getElementById("countdown");
const startBtn = document.getElementById("startBtn");
const liveStrip = document.getElementById("liveStrip");

if (video) {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => (video.srcObject = stream))
    .catch(() => alert("Camera access denied 😭"));

  startBtn.addEventListener("click", async () => {
    const photos = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 480;
    canvas.height = 360;

    // Countdown before starting
    for (let i = 3; i > 0; i--) {
      countdownEl.textContent = i;
      await new Promise(r => setTimeout(r, 700));
    }
    countdownEl.textContent = "";

    // Capture 4 shots
    for (let i = 0; i < 4; i++) {
      for (let j = 2; j > 0; j--) {
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

      if (liveStrip) {
        const imgEl = liveStrip.querySelectorAll(".strip-img")[i];
        if (imgEl) imgEl.src = photoData;
      }
      await new Promise(r => setTimeout(r, 500));
    }

    localStorage.setItem("photos", JSON.stringify(photos));
    window.location.href = "result.html";
  });
}

// RESULT PAGE
if (document.body.classList.contains("result")) {
  const photos = JSON.parse(localStorage.getItem("photos")) || [];
  for (let i = 0; i < photos.length; i++) {
    document.getElementById(`photo${i + 1}`).src = photos[i];
  }
}

// Retake + Continue
function retakePhotos() {
  localStorage.removeItem("photos");
  window.location.href = "booth.html";
}

function goToEditor() {
  window.location.href = "editor.html";
}

// EDITOR PAGE
const editorStrip = document.getElementById("editorStrip");
if (editorStrip) {
  const photos = JSON.parse(localStorage.getItem("photos")) || [];
  photos.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    editorStrip.appendChild(img);
  });
  editorStrip.style.background = "#d5c6a1"; // default beige frame
}

// Frame color change
function changeEditorFrame(color) {
  const colors = {
    white: "#ffffff",
    beige: "#d5c6a1",
    pink: "#e398a3",
    none: "transparent"
  };
  editorStrip.style.background = colors[color] || "transparent";
}

// Download edited
async function downloadEditedStrip() {
  const canvas = await html2canvas(editorStrip, { scale: 2 });
  const link = document.createElement("a");
  link.download = "gotham-strip.png";
  link.href = canvas.toDataURL();
  link.click();
}
