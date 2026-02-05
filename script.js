const modelViewer = document.querySelector('model-viewer');
const secretButton = document.querySelector('.HotspotSecret');
const backButton = document.querySelector('.back');

document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('progress-bar');
    const balloonLetters = document.querySelector('.balloon-letters');
    let progress = 0;

    // Function to update progress smoothly
    const updateProgress = () => {
        if (progress < 100) {
            progress += 1.5; // Increment progress smoothly
            progressBar.value = progress; // Update the progress bar
            requestAnimationFrame(updateProgress); // Call the function again for smooth animation
        } else {
            // Hide the loading overlay when progress reaches 100
            balloonLetters.classList.add('loaded');
        }
    };

    // Start updating progress
    requestAnimationFrame(updateProgress);
});

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