document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');
    const closeBtn = document.getElementById('close-btn');
    const animatedContainers = document.querySelectorAll('.animated-container');

    openBtn.addEventListener('click', () => {
        sidebar.style.left = '0';
    });

    closeBtn.addEventListener('click', () => {
        sidebar.style.left = '-250px';
    });

    // Add the 'show' class to start the animation for containers
    animatedContainers.forEach(container => {
        setTimeout(() => {
            container.classList.add('show');
        }, 100);
    });
});
