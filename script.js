const modelViewer = document.querySelector("model-viewer");
const secretButton = document.querySelector(".HotspotSecret");
const backButton = document.querySelector(".back");

const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;

if (isMac) {
  document.addEventListener('DOMContentLoaded', () => {
    const modifierKeys = document.querySelectorAll('.modifier-key');
    modifierKeys.forEach(key => {
      key.textContent = '⌘'; // of gebruik '⌘' voor het symbool
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.getElementById("progress-bar");
  const balloonLetters = document.querySelector(".balloon-letters");
  let progress = 0;

  // Function to update progress smoothly
  const updateProgress = () => {
    if (progress < 100) {
      progress += 1; // Increment progress smoothly
      progressBar.value = progress; // Update the progress bar
      requestAnimationFrame(updateProgress); // Call the function again for smooth animation
    } else {
      // Hide the loading overlay when progress reaches 100
      balloonLetters.classList.add("loaded");
    }
  };

  // Start updating progress
  requestAnimationFrame(updateProgress);
});

secretButton.addEventListener("click", () => {
    modelViewer.animationName = "Run";
    modelViewer.play();

    modelViewer.style.transition = "transform 3s linear";
    modelViewer.style.transform = "translateX(150%)";

    setTimeout(() => {
        backButton.style.display = "block";
    }, 3000);
});

document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        secretButton.click();

        backButton.style.display = "block";
                
                // Reset rotation to default
                modelViewer.orientation = "0deg 0deg 100deg";
    }
});

backButton.addEventListener("click", () => {
  modelViewer.style.transition = "transform 0s";
  modelViewer.style.transform = "translateX(0)";
  modelViewer.animationName = "Idle2";
  modelViewer.play();

  backButton.style.display = "none";
});

// Originele texture opslaan
let originalTexture = null;

// Functie om texture aan te passen op basis van color scheme
const updateTexture = async (isDark) => {
  await modelViewer.model;

  const material = modelViewer.model.materials[0];

  if (isDark) {
    // Dark mode: gebruik originele texture uit GLB bestand
    if (originalTexture) {
      material.pbrMetallicRoughness.baseColorTexture.setTexture(
        originalTexture,
      );
    }
  } else {
    // Light mode: gebruik texture.png
    const texture = await modelViewer.createTexture(
      "assets/images/texture.png",
    );
    material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
  }
};


window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches }) => {
    updateTexture(matches);
  });


modelViewer.addEventListener("load", () => {

  const material = modelViewer.model.materials[0];
  originalTexture = material.pbrMetallicRoughness.baseColorTexture.texture;

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  updateTexture(isDark);
});

// Bron copilot: "ik wil dat de dl pas zichbaar wordt wanneer je de konami code hebt ingevuld"

const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  const expectedKey = konamiCode[konamiIndex].toLowerCase();
  
  if (key === expectedKey) {
    konamiIndex++;
    
    if (konamiIndex === konamiCode.length) {
      const cheatsheet = document.querySelector('.cheatsheet');
      cheatsheet.classList.add('visible');
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }

  // Trigger key press animation
  if (key === '5') {
    const keyElement = document.getElementById('key-5');
    if (keyElement) keyElement.classList.add('pressed');
  }
  if (key === 's') {
    const keyElement = document.getElementById('key-s');
    if (keyElement) keyElement.classList.add('pressed');
  }
  if (e.ctrlKey || e.metaKey) {
    const keyElement = document.getElementById('key-ctrl');
    if (keyElement) keyElement.classList.add('pressed');
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();

  // Remove key press animation
  if (key === '5') {
    const keyElement = document.getElementById('key-5');
    if (keyElement) keyElement.classList.remove('pressed');
  }
  if (key === 's') {
    const keyElement = document.getElementById('key-s');
    if (keyElement) keyElement.classList.remove('pressed');
  }
  if (key === 'control' || key === 'meta') {
    const keyElement = document.getElementById('key-ctrl');
    if (keyElement) keyElement.classList.remove('pressed');
  }
});

