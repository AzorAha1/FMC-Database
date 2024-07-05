document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');
    const closeBtn = document.getElementById('close-btn');

    openBtn.addEventListener('click', () => {
        sidebar.style.left = '0';
    });

    closeBtn.addEventListener('click', () => {
        sidebar.style.left = '-250px';
    });
});