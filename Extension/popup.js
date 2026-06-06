const EDUTUBE_URL = "https://no-distraction-youtube-nx3s.vercel.app/";

document.addEventListener("DOMContentLoaded", async () => {
  const btnSolo = document.getElementById("btn-solo");
  const btnRoom = document.getElementById("btn-room");
  const actionsDiv = document.getElementById("video-actions");
  const errorDiv = document.getElementById("error-state");

  // Get current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url) return;

  const url = new URL(tab.url);
  const isYouTubeVideo = url.hostname.includes("youtube.com") && url.pathname === "/watch";
  const videoId = url.searchParams.get("v");

  if (!isYouTubeVideo || !videoId) {
    actionsDiv.classList.add("hidden");
    errorDiv.classList.remove("hidden");
    return;
  }

  btnSolo.addEventListener("click", () => {
    const listId = url.searchParams.get("list");
    let watchUrl = `${EDUTUBE_URL}/video/${videoId}`;

    if (listId) {
      watchUrl = `${EDUTUBE_URL}/video/${videoId}/${listId}`;
    }

    chrome.tabs.create({ url: watchUrl });
  });

  btnRoom.addEventListener("click", () => {
    const roomUrl = `${EDUTUBE_URL}/study-room?video=${videoId}`;
    chrome.tabs.create({ url: roomUrl });
  });
});
