// Constants
const DOM = {
  modelViewer: document.querySelector("model-viewer"),
  secretButton: document.querySelector(".HotspotSecret"),
  backButton: document.querySelector(".back"),
  skillsButton: document.querySelector("#skills-button"),
  refreshButton: document.querySelector(".refresh"),
};

const API_URL = "https://fdnd.directus.app/items";
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

// Utilities
const isMac = navigator.userAgent.toUpperCase().includes('MAC');

// Mac modifier key fix
if (isMac) {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modifier-key').forEach(key => key.textContent = '⌘');
  });
}

// Progress bar animation
document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById("progress-bar");
  const balloonLetters = document.querySelector(".balloon-letters");
  let progress = 0;

  const updateProgress = () => {
    if (progress < 100) {
      progress++;
      progressBar.value = progress;
      requestAnimationFrame(updateProgress);
    } else {
      balloonLetters.classList.add("loaded");
    }
  };

  requestAnimationFrame(updateProgress);
});

// Animation handlers
DOM.secretButton.addEventListener("click", () => {
  DOM.modelViewer.animationName = "Run";
  DOM.modelViewer.play();
  DOM.modelViewer.style.transition = "transform 3s linear";
  DOM.modelViewer.style.transform = "translateX(150%)";
  setTimeout(() => DOM.backButton.style.display = "block", 3000);
});

DOM.backButton.addEventListener("click", () => {
  DOM.modelViewer.style.transition = "transform 0s";
  DOM.modelViewer.style.transform = "translateX(0)";
  DOM.modelViewer.animationName = "Idle2";
  DOM.modelViewer.play();
  DOM.backButton.style.display = "none";
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    DOM.secretButton.click();
    DOM.modelViewer.orientation = "0deg 0deg 100deg";
  }
});

// Texture management
let originalTexture = null;

const updateTexture = async (isDark) => {
  await DOM.modelViewer.model;
  const material = DOM.modelViewer.model.materials[0];

  if (isDark && originalTexture) {
    material.pbrMetallicRoughness.baseColorTexture.setTexture(originalTexture);
  } else if (!isDark) {
    const texture = await DOM.modelViewer.createTexture("assets/images/texture.png");
    material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
  }
};

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches }) => {
  updateTexture(matches);
});

DOM.modelViewer.addEventListener("load", () => {
  const material = DOM.modelViewer.model.materials[0];
  originalTexture = material.pbrMetallicRoughness.baseColorTexture.texture;
  updateTexture(window.matchMedia("(prefers-color-scheme: dark)").matches);
});

// Konami code handler
let konamiIndex = 0;

const keyMap = { '5': 'key-5', 's': 'key-s' };

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  
  if (key === KONAMI_CODE[konamiIndex].toLowerCase()) {
    konamiIndex++;
    if (konamiIndex === KONAMI_CODE.length) {
      document.querySelector('.cheatsheet')?.classList.add('visible');
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }

  // Key press animations
  const keyElement = keyMap[key] ? document.getElementById(keyMap[key]) : null;
  if (keyElement) keyElement.classList.add('pressed');
  if (e.ctrlKey || e.metaKey) document.getElementById('key-ctrl')?.classList.add('pressed');
});

document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  const keyElement = keyMap[key] ? document.getElementById(keyMap[key]) : null;
  if (keyElement) keyElement.classList.remove('pressed');
  if (key === 'control' || key === 'meta') document.getElementById('key-ctrl')?.classList.remove('pressed');
});

// API functions
async function getData() {
  const skillsImage = document.querySelector(".avatar-img");
  const avatarFallback = document.querySelector(".avatar-fallback");
  const skillsParagraph = document.querySelector("#skills-popover p");
  const skeletonLoader = document.querySelector(".skeleton-loader");
  const contentLoaded = document.querySelector(".content-loaded");
  
  const baseEndpoint = "/person?filter[squads][squad_id][tribe][name]=CMD%20Minor%20Web%20Dev&filter[squads][squad_id][cohort]=2526";
  
  const showLoader = (isLoading) => {
    skeletonLoader.style.display = isLoading ? "flex" : "none";
    contentLoaded.style.display = isLoading ? "none" : "flex";
  };

  showLoader(true);
  
  try {
    const countResponse = await fetch(`${API_URL}${baseEndpoint}&limit=0&meta=filter_count`);
    if (!countResponse.ok) throw new Error(`Response status: ${countResponse.status}`);

    const { meta } = await countResponse.json();
    const totalCount = meta?.filter_count ?? 0;
    if (totalCount === 0) throw new Error("No results found.");

    const randomOffset = Math.floor(Math.random() * totalCount);
    const response = await fetch(`${API_URL}${baseEndpoint}&limit=1&offset=${randomOffset}`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const { data } = await response.json();
    const { name, avatar } = data[0];

    skillsParagraph.textContent = name;
    
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

async function getJelleData() {
  try {
    const response = await fetch(`${API_URL}/person?filter[id]=295`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const { data } = await response.json();
    const { name, bio } = data[0];

    const infoPopover = document.querySelector("#info-popover");
    infoPopover.querySelector("h2").textContent = name;
    infoPopover.querySelector("p").textContent = bio;
  } catch (error) {
    console.error(error.message);
  }
}

// Initialize
getJelleData();
getData();
DOM.refreshButton.addEventListener("click", getData);
