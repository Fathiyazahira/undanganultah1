
const music = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("musicButton");

// Nama tamu otomatis dari URL
const params = new URLSearchParams(window.location.search);
const guest = params.get("to");

if (guest && guest.trim() !== "") {
  document.getElementById("guestName").textContent = guest;
  document.getElementById("rsvpName").value = guest;
}

// Membuka undangan
function openInvitation() {
  document.getElementById("cover").classList.add("hidden");
  document.getElementById("invitation").classList.remove("hidden");
  musicButton.classList.remove("hidden");

  music.play()
    .then(() => {
      musicButton.classList.add("playing");
    })
    .catch(() => {
      showToast("Tekan tombol musik untuk memutar lagu");
    });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Kontrol musik
function toggleMusic() {
  if (music.paused) {
    music.play()
      .then(() => musicButton.classList.add("playing"))
      .catch(() => showToast("Musik belum dapat diputar"));
  } else {
    music.pause();
    musicButton.classList.remove("playing");
  }
}

// Countdown menuju 20 Desember 2026
const eventDate = new Date("2026-12-20T00:00:00+07:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = eventDate - now;

  if (distance <= 0) {
    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Simpan acara ke Google Calendar
function saveCalendar() {
  const calendarURL =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent("Birthday Celebration - Fathiya") +
    "&dates=20261220/20261221" +
    "&details=" + encodeURIComponent("Birthday Celebration Fathiya") +
    "&location=" + encodeURIComponent("Sushi Yay! - Mall Bintaro Xchange 2") +
    "&ctz=Asia%2FJakarta";

  window.open(calendarURL, "_blank");
}

// Notifikasi kecil
let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Fungsi umum untuk menyalin teks
function copyText(text, successMessage) {
  if (!text || text.includes("[") || text.includes("]")) {
    showToast("Isi data terlebih dahulu.");
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMessage))
      .catch(() => fallbackCopy(text, successMessage));
  } else {
    fallbackCopy(text, successMessage);
  }
}

// Alternatif menyalin teks
function fallbackCopy(text, successMessage) {
  const textArea = document.createElement("textarea");

  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.select();

  try {
    const success = document.execCommand("copy");

    if (success) {
      showToast(successMessage);
    } else {
      showToast("Gagal menyalin teks.");
    }
  } catch (error) {
    showToast("Gagal menyalin teks.");
  }

  textArea.remove();
}

// Salin nomor rekening
function copyAccountNumber() {
  const account = document.getElementById("accountNumber").textContent.trim();

  copyText(account, "Nomor rekening berhasil disalin!");
}

// Salin alamat pengiriman kado
function copyGiftAddress() {
  const address = document.getElementById("giftAddress").textContent.trim();

  copyText(address, "Alamat berhasil disalin!");
}

// RSVP dan buku tamu
const rsvpForm = document.getElementById("rsvpForm");
const guestbookList = document.getElementById("guestbookList");

function getGuestbook() {
  try {
    const data = JSON.parse(localStorage.getItem("birthdayGuestbook"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function displayGuestbook() {
  const messages = getGuestbook();
  guestbookList.replaceChildren();

  if (messages.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "Belum ada ucapan. Jadilah yang pertama!";
    guestbookList.appendChild(empty);
    return;
  }

  messages.slice().reverse().forEach((item) => {
    const entry = document.createElement("div");
    entry.className = "guestbook-entry";

    const name = document.createElement("h3");
    name.textContent = item.name;

    const attendance = document.createElement("span");
    attendance.className = "attendance";
    attendance.textContent = item.attendance;

    const message = document.createElement("p");
    message.textContent = item.message;

    const date = document.createElement("small");
    date.textContent = item.date;

    entry.append(name, attendance, message, date);
    guestbookList.appendChild(entry);
  });
}

rsvpForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("rsvpName").value.trim();
  const attendance = document.getElementById("attendance").value;
  const message = document.getElementById("message").value.trim();

  if (!name || !attendance || !message) {
    showToast("Lengkapi semua data terlebih dahulu");
    return;
  }

  const messages = getGuestbook();

  messages.push({
    name: name,
    attendance: attendance,
    message: message,
    date: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  });

  try {
    localStorage.setItem("birthdayGuestbook", JSON.stringify(messages));
    displayGuestbook();
    rsvpForm.reset();
    showToast("Ucapan berhasil dikirim!");
  } catch {
    showToast("Penyimpanan penuh atau tidak tersedia");
  }
});

displayGuestbook();

// Animasi ketika halaman digulir
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15
});

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});
// LIGHTBOX GALLERY
const galleryImages = [
  "Perayaan Ulang Tahun Sushi Ungu.jpg",
  "About Us.jpg",
  "birthday girl aesthetics.jpg",
  "ultah.jpg"
];

let currentPhoto = 0;

function openLightbox(index) {
  currentPhoto = index;
  showPhoto();

  document.getElementById("lightbox").classList.add("active");
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("active");
}

function showPhoto() {
  document.getElementById("lightboxImage").src =
    galleryImages[currentPhoto];

  document.getElementById("photoCounter").textContent =
    `${currentPhoto + 1} / ${galleryImages.length}`;
}

function changePhoto(direction) {
  currentPhoto += direction;

  if (currentPhoto >= galleryImages.length) {
    currentPhoto = 0;
  }

  if (currentPhoto < 0) {
    currentPhoto = galleryImages.length - 1;
  }

  showPhoto();
}

// Tutup dengan tombol Escape
document.addEventListener("keydown", function(event) {
  if (!document.getElementById("lightbox").classList.contains("active")) {
    return;
  }

  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowRight") changePhoto(1);
  if (event.key === "ArrowLeft") changePhoto(-1);
});

// Geser foto menggunakan jari
let touchStartX = 0;

document.getElementById("lightbox").addEventListener("touchstart", function(e) {
  touchStartX = e.changedTouches[0].screenX;
});

document.getElementById("lightbox").addEventListener("touchend", function(e) {
  let touchEndX = e.changedTouches[0].screenX;
  let difference = touchEndX - touchStartX;

  if (Math.abs(difference) > 50) {
    changePhoto(difference < 0 ? 1 : -1);
  }
});