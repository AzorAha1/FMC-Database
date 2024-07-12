document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        var preloader = document.getElementById('preloader');
        preloader.style.display = 'none';
        
        var content = document.getElementById('content');
        content.style.display = 'block';
        
        document.body.style.overflow = 'auto';
    }, 3000);  
});
function validatePassword() {
    const password = document.getElementById('password').value;
    const passwordHelp = document.getElementById('passwordHelp');
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!regex.test(password)) {
        passwordHelp.style.color = 'red';
        return false;
    }

    passwordHelp.style.color = 'green';
    return true;
}

