const secretButton = document.querySelector('.Hotspot[slot="hotspot-1"]');

secretButton.addEventListener('click', () => {
  modelViewer.animationName= 'Run';
  modelViewer.play();
});