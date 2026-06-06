const EDUTUBE_URL = "https://no-distraction-youtube-nx3s.vercel.app/";

function injectEduTubeButton() {
  // Prevent multiple injections
  if (document.getElementById("edutube-inject-btn")) {
    // If the URL changed but the button is still there, we must update the href!
    updateButtonHref();
    return true;
  }

  // Try multiple possible container selectors for YouTube's action menu
  const selectors = [
    '#top-level-buttons-computed',
    '#actions-inner',
    'ytd-menu-renderer #top-level-buttons',
    '#actions.ytd-watch-metadata'
  ];

  let actionsContainer = null;
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      actionsContainer = el;
      break;
    }
  }

  if (!actionsContainer) {
    return false;
  }

  const btnSolo = document.createElement("a");
  btnSolo.id = "edutube-inject-btn";
  btnSolo.className = "edutube-inject-btn";
  
  const btnRoom = document.createElement("a");
  btnRoom.id = "edutube-inject-btn-room";
  btnRoom.className = "edutube-inject-btn secondary";

  // SVG Icon (Graduation Cap / Book) for Solo
  btnSolo.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
    Study Solo
  `;
  
  // SVG Icon (Users) for Room
  btnRoom.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    Study Together
  `;

  // Insert them (insert Room first so it ends up on the right of Solo, wait no, insertBefore puts it before the first child.
  // If we insert Room then Solo, Solo will be leftmost.)
  actionsContainer.insertBefore(btnRoom, actionsContainer.firstChild);
  actionsContainer.insertBefore(btnSolo, actionsContainer.firstChild);

  updateButtonHref();
  return true;
}

function updateButtonHref() {
  const btnSolo = document.getElementById("edutube-inject-btn");
  const btnRoom = document.getElementById("edutube-inject-btn-room");
  
  if (!btnSolo || !btnRoom) return;

  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  const listId = urlParams.get('list');

  if (!videoId) return;

  let soloTargetUrl = `${EDUTUBE_URL}/video/${videoId}`;
  if (listId) {
    soloTargetUrl = `${EDUTUBE_URL}/video/${videoId}/${listId}`;
  }
  
  const roomTargetUrl = `${EDUTUBE_URL}/study-room?video=${videoId}`;

  btnSolo.href = soloTargetUrl;
  btnSolo.target = "_blank"; 
  
  btnRoom.href = roomTargetUrl;
  btnRoom.target = "_blank";
}

// A more robust polling mechanism for single page app navigation
let checkInterval;
function startChecking() {
  clearInterval(checkInterval);
  checkInterval = setInterval(() => {
    if (window.location.pathname === '/watch') {
      const injected = injectEduTubeButton();
      // We don't stop checking entirely because the user might navigate to another video 
      // where YouTube completely replaces the DOM nodes.
    }
  }, 1000);
}

// Listen for YouTube's custom navigation events
window.addEventListener('yt-navigate-finish', startChecking);
window.addEventListener('yt-page-data-updated', startChecking);

// Also start checking immediately on load
startChecking();
