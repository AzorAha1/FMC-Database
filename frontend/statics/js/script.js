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
    const signupPassword = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const passwordHelp = document.getElementById('signupPasswordHelp');
    const confirmPasswordHelp = document.getElementById('confirmPasswordHelp');
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    let valid = true;

    if (signupPassword) {
        if (signupPassword.value === '') {
            passwordHelp.style.color = 'red';
            passwordHelp.innerText = 'Password field is empty 🫙';
            valid = false;
        } else if (!regex.test(signupPassword.value)) {
            passwordHelp.style.color = 'red';
            passwordHelp.innerText = 'Password must be at least 8 characters long and contain letters, numbers, and special characters. 👎🏽';
            valid = false;
        } else {
            passwordHelp.innerText = 'Strong Password 👍🏽';
            passwordHelp.style.color = 'green';
        }
    }

    if (confirmPassword) {
        if (confirmPassword.value === '') {
            confirmPasswordHelp.style.color = 'red';
            confirmPasswordHelp.innerText = 'Confirm Password field is empty 🫙';
            valid = false;
        } else if (signupPassword && confirmPassword.value !== signupPassword.value) {
            confirmPasswordHelp.style.color = 'red';
            confirmPasswordHelp.innerText = "Passwords don't match 🙁";
            valid = false;
        } else {
            confirmPasswordHelp.innerText = "Passwords Match 🥳";
            confirmPasswordHelp.style.color = 'green';
        }
    }
    return valid;
}

