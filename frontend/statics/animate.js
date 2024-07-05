
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    // Add the 'show' class to start the animation
    setTimeout(() => {
        container.classList.add('show');
    }, 100); // Delay to ensure the animation runs
});