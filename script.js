const modelViewer = document.querySelector('model-viewer');
const secretButton = document.querySelector('.HotspotSecret');
const backButton = document.querySelector('.back');

secretButton.addEventListener('click', () => {
  modelViewer.animationName = 'Run';
  modelViewer.play();

  // Add CSS transform to move the model off-screen
      modelViewer.style.transition = 'transform 3s linear';
  modelViewer.style.transform = 'translateX(150%)';

  setTimeout(() => {

    backButton.style.display = 'block';
  }, 3000);
});

backButton.addEventListener('click', () => {
        modelViewer.style.transition = 'transform 0s';
  modelViewer.style.transform = 'translateX(0)';
  modelViewer.animationName = 'Idle2';
  modelViewer.play();

    backButton.style.display = 'none';
});