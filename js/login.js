import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// If already logged in, redirect to admin page
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "admin.html";
    }
});

const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');

if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            errorMsg.style.display = 'none';
            // Show loading state on button
            const btn = loginForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Logging in...';
            btn.disabled = true;

            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the redirect
            
        } catch (error) {
            console.error("Login Error:", error);
            errorMsg.innerText = error.message;
            errorMsg.style.display = 'block';
            
            const btn = loginForm.querySelector('button');
            btn.innerText = 'Login';
            btn.disabled = false;
        }
    });
}
