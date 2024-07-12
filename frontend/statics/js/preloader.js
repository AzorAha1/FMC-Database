document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        var preloader = document.getElementById('preloader');
        preloader.style.display = 'none';
        
        var content = document.getElementById('content');
        content.style.display = 'block';
        
        document.body.style.overflow = 'auto';
    }, 3000);  
});