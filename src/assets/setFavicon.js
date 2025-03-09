// src/utils/setFavicon.js
export function setFavicon(url) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png"; // <-- إضافة
      link.sizes = "any";     // <-- إضافة
      document.head.appendChild(link);
    }
    link.href = url || "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg";
  }
  