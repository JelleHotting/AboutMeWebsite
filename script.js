// ========== CONSTANTS ==========
// DOM elements die overal in de code gebruikt worden
const DOM = {
  modelViewer: document.querySelector("model-viewer"), // 3D model viewer element
  secretButton: document.querySelector(".HotspotSecret"), // Button om model weg te laten rennen
  backButton: document.querySelector(".back"), // Button om model terug te halen
  skillsButton: document.querySelector("#skills-button"), // Button voor skills popover
  refreshButton: document.querySelector(".refresh"), // Button om random persoon opnieuw in te laden
};

// Directus CMS API - https://fdnd.directus.app/items - Docs: https://docs.directus.io/reference/introduction.html
const API_URL = "https://fdnd.directus.app/items";

// Konami Code - https://en.wikipedia.org/wiki/Konami_Code
// Sequence: ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️B+A (triggers cheatsheet)
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

// ========== UTILITIES ==========
// Detecteer of gebruiker op Mac zit
const isMac = navigator.userAgent.toUpperCase().includes('MAC');

// Mac modifier key fix - Verander CTRL tekst naar ⌘ op Mac
if (isMac) {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modifier-key').forEach(key => key.textContent = '⌘');
  });
}

// ========== PROGRESS BAR ANIMATION ==========
// requestAnimationFrame - MDN: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
// Animate loading bar van 0% naar 100% en show content daarna
document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById("progress-bar");
  const balloonLetters = document.querySelector(".balloon-letters");
  let progress = 0;

  // Update progress bar elke frame totdat het 100% is
  const updateProgress = () => {
    if (progress < 100) {
      progress++;
      progressBar.value = progress;
      requestAnimationFrame(updateProgress);
    } else {
      // Wanneer animatie klaar is, toon de content
      balloonLetters.classList.add("loaded");
    }
  };

  requestAnimationFrame(updateProgress);
});

// ========== ANIMATION HANDLERS ==========
// EventListener (click) - MDN: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// Secret button: Zorg dat karakter werent en veranderen van positie
DOM.secretButton.addEventListener("click", () => {
  // Speel "Run" animatie af
  DOM.modelViewer.animationName = "Run";
  DOM.modelViewer.play();
  // Schuif model naar rechts buiten het scherm (3 seconden)
  DOM.modelViewer.style.transition = "transform 3s linear";
  DOM.modelViewer.style.transform = "translateX(150%)";
  // Toon back button nadat karakter weg is
  setTimeout(() => DOM.backButton.style.display = "block", 3000);
});

// Back button: Bring karakter terug
DOM.backButton.addEventListener("click", () => {
  // Zet transition uit zodat het instant terug komt
  DOM.modelViewer.style.transition = "transform 0s";
  DOM.modelViewer.style.transform = "translateX(0)";
  // Speel idle animatie af
  DOM.modelViewer.animationName = "Idle2";
  DOM.modelViewer.play();
  // Verberg back button
  DOM.backButton.style.display = "none";
});

// ========== KEYBOARD SHORTCUTS ==========
// EventListener (keydown) - MDN: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// Ctrl+S (of Cmd+S op Mac) trigger secret button animation
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault(); // Voorkom default save dialog
    DOM.secretButton.click(); // Trigger secret animation
    DOM.modelViewer.orientation = "0deg 0deg 100deg"; // Rotate het model
  }
  
  // 5 key triggers confetti party mode
  if (e.key === "5") {
    e.preventDefault();
    triggerConfetti();
  }
});

// ========== CONFETTI EFFECT ==========
// Canvas Confetti - https://github.com/catdad/canvas-confetti - Demo: https://www.kirilv.com/canvas-confetti/
// Party mode confetti effect wanneer gebruiker op 5 drukt
function triggerConfetti() {
  const duration = 3000; // 3 seconden
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Confetti van links
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    
    // Confetti van rechts
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

// ========== TEXTURE MANAGEMENT (DARK MODE) ==========
// matchMedia API - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
// Save originele texture voor later
let originalTexture = null;

// Verander texture van model afhankelijk van dark/light mode
const updateTexture = async (isDark) => {
  await DOM.modelViewer.model;
  const material = DOM.modelViewer.model.materials[0];

  if (isDark && originalTexture) {
    // Dark mode: gebruik originele texture
    material.pbrMetallicRoughness.baseColorTexture.setTexture(originalTexture);
  } else if (!isDark) {
    // Light mode: laad custom texture
    const texture = await DOM.modelViewer.createTexture("assets/images/texture.png");
    material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
  }
};

// Luister naar color scheme verandering (wanneer gebruiker dark/light mode switcht)
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches }) => {
  updateTexture(matches);
});

// Wanneer model geladen is, save originele texture en update texture
DOM.modelViewer.addEventListener("load", () => {
  const material = DOM.modelViewer.model.materials[0];
  originalTexture = material.pbrMetallicRoughness.baseColorTexture.texture;
  updateTexture(window.matchMedia("(prefers-color-scheme: dark)").matches);
});

// ========== KONAMI CODE HANDLER ==========
// EventListener (keydown, keyup) - MDN: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// Track position in konami code sequence
let konamiIndex = 0;

// Map toetsen naar HTML elementen met IDs voor visual feedback
const keyMap = { '5': 'key-5', 's': 'key-s' };

// Luister naar keydown om konami code te detecteren en key animations af te spelen
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  
  // Check of huidige toets overeenkomt met volgende toets in konami code
  if (key === KONAMI_CODE[konamiIndex].toLowerCase()) {
    konamiIndex++;
    // Als konami code compleet is, toon cheatsheet
    if (konamiIndex === KONAMI_CODE.length) {
      document.querySelector('.cheatsheet')?.classList.add('visible');
      konamiIndex = 0; // Reset counter
    }
  } else {
    konamiIndex = 0; // Reset als fout toets ingedrukt
  }

  // Visual feedback: add 'pressed' class aan toetsenbord elementen
  const keyElement = keyMap[key] ? document.getElementById(keyMap[key]) : null;
  if (keyElement) keyElement.classList.add('pressed');
  if (e.ctrlKey || e.metaKey) document.getElementById('key-ctrl')?.classList.add('pressed');
});

// Remove 'pressed' class wanneer toets losgelaten wordt
document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  const keyElement = keyMap[key] ? document.getElementById(keyMap[key]) : null;
  if (keyElement) keyElement.classList.remove('pressed');
  if (key === 'control' || key === 'meta') document.getElementById('key-ctrl')?.classList.remove('pressed');
});

// ========== API FUNCTIONS ==========
// Fetch API - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// Haal random persoon op uit Directus API
async function getData() {
  const skillsImage = document.querySelector(".avatar-img");
  const avatarFallback = document.querySelector(".avatar-fallback");
  const skillsParagraph = document.querySelector("#skills-popover p");
  const skeletonLoader = document.querySelector(".skeleton-loader");
  const contentLoaded = document.querySelector(".content-loaded");
  
  // Filter: Haal personen op van CMD Minor Web Dev cohort 2526
  const baseEndpoint = "/person?filter[squads][squad_id][tribe][name]=CMD%20Minor%20Web%20Dev&filter[squads][squad_id][cohort]=2526";
  
  // Toggle tussen skeleton loader en content
  const showLoader = (isLoading) => {
    skeletonLoader.style.display = isLoading ? "flex" : "none";
    contentLoaded.style.display = isLoading ? "none" : "flex";
  };

  showLoader(true);
  
  try {
    // Stap 1: Tel hoeveel personen voldoen aan filter
    const countResponse = await fetch(`${API_URL}${baseEndpoint}&limit=0&meta=filter_count`);
    if (!countResponse.ok) throw new Error(`Response status: ${countResponse.status}`);

    const { meta } = await countResponse.json();
    const totalCount = meta?.filter_count ?? 0;
    if (totalCount === 0) throw new Error("No results found.");

    // Stap 2: Haal 1 random persoon op
    const randomOffset = Math.floor(Math.random() * totalCount);
    const response = await fetch(`${API_URL}${baseEndpoint}&limit=1&offset=${randomOffset}`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const { data } = await response.json();
    const { name, avatar } = data[0];

    if (name == "Sanne 't Hooft") {
skillsImage.classList.toggle("spin");
    } else {
      skillsImage.classList.remove("spin");
    
    }



    // Update HTML met persoonsnaam
    skillsParagraph.textContent = name;
    
    // Toon avatar als beschikbaar, anders toon fallback
    if (avatar) {
      skillsImage.src = avatar;
      skillsImage.style.display = "block";
      avatarFallback.style.display = "none";
    } else {
      skillsImage.style.display = "none";
      avatarFallback.style.display = "block";
    }
  } catch (error) {
    console.error(error.message);
  } finally {
    showLoader(false);
  }
}

// Haal Jelle's persoonlijke info op uit API
async function getJelleData() {
  try {
    const response = await fetch(`${API_URL}/person?filter[id]=295`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const { data } = await response.json();
    const { name, birthdate, shoe_size, fav_fruit, fav_tag, nickname} = data[0];

    // Update info popover met Jelle's data
    const infoPopover = document.querySelector("#info-popover");
    infoPopover.querySelector("h2").textContent = name;
    
    // Bereken leeftijd van birthdate
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth()) {
      age--;
    }

    // Update alle velden
    // infoPopover.querySelector("h2").innerHTML = nickname || name;
    infoPopover.querySelector("time").setAttribute("datetime", "P"+age+"Y");
    infoPopover.querySelector("time").textContent = `${age}`;
    infoPopover.querySelector("#shoe-size").textContent = `${shoe_size}`;
    infoPopover.querySelector("#fav-fruit").textContent = `${fav_fruit}`;
    infoPopover.querySelector("#fav-tag").textContent = `${fav_tag}`;
    

  } catch (error) {
    console.error(error.message);
  }
}

// ========== INITIALIZATION ==========
// Laad Jelle's Info
getJelleData();
// Laad random persoon
getData();
// Voeg refresh functionaliteit toe aan refresh button
DOM.refreshButton.addEventListener("click", getData);


